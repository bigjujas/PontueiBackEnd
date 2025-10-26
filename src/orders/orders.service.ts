import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, CreatePaymentDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(clientId: string, createOrderDto: CreateOrderDto) {
    const { establishment_id, items } = createOrderDto;

    // Verify establishment exists
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishment_id },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    // Verify all products exist and are active
    const productIds = items.map(item => item.product_id);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        establishment_id,
        is_active: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products are not available');
    }

    // Calculate total amount and points
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    const pointsGenerated = Math.floor(totalAmount / 10); // 1 point per R$10

    // Create order with items in a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          client_id: clientId,
          establishment_id,
          total_amount: totalAmount,
          points_generated: pointsGenerated,
        },
      });

      // Create order items separately
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      // Get order items and establishment separately
      const orderItemsWithProducts = await tx.orderItem.findMany({
        where: { order_id: order.id },
        include: {
          product: true,
        },
      });

      const establishment = await tx.establishment.findUnique({
        where: { id: order.establishment_id },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        ...order,
        order_items: orderItemsWithProducts,
        establishment,
      };
    });
  }

  async findMyOrders(clientId: string) {
    const orders = await this.prisma.order.findMany({
      where: { client_id: clientId },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get order items and payments for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await this.prisma.orderItem.findMany({
          where: { order_id: order.id },
          include: {
            product: true,
          },
        });

        const payments = await this.prisma.payment.findMany({
          where: { order_id: order.id },
        });

        const establishment = await this.prisma.establishment.findUnique({
          where: { id: order.establishment_id },
          select: {
            id: true,
            name: true,
          },
        });

        return {
          ...order,
          order_items: orderItems,
          establishment,
          payments,
        };
      })
    );

    return ordersWithDetails;
  }

  async findStoreOrders(clientId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const orders = await this.prisma.order.findMany({
      where: { establishment_id: establishment.id },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get order items, payments and client for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await this.prisma.orderItem.findMany({
          where: { order_id: order.id },
          include: {
            product: true,
          },
        });

        const payments = await this.prisma.payment.findMany({
          where: { order_id: order.id },
        });

        const client = await this.prisma.client.findUnique({
          where: { id: order.client_id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        return {
          ...order,
          order_items: orderItems,
          client,
          payments,
        };
      })
    );

    return ordersWithDetails;
  }

  async updateOrderStatus(clientId: string, orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        establishment_id: establishment.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: updateOrderStatusDto.status },
    });

    // Get related data
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        product: true,
      },
    });

    const payments = await this.prisma.payment.findMany({
      where: { order_id: orderId },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: updatedOrder.client_id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      ...updatedOrder,
      order_items: orderItems,
      client,
      payments,
    };
  }

  async createPayment(clientId: string, orderId: string, createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        client_id: clientId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot create payment for cancelled order');
    }

    return this.prisma.payment.create({
      data: {
        order_id: orderId,
        client_id: clientId,
        amount: parseFloat(createPaymentDto.amount),
        payment_method: createPaymentDto.method,
        status: 'pending',
        transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    });
  }

  async completeOrder(clientId: string, orderId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        establishment_id: establishment.id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'ready') {
      throw new BadRequestException('Order must be ready to be completed');
    }

    // Critical transaction: Update order status, add points to client, create points transaction
    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });

      // Add points to client balance
      await tx.client.update({
        where: { id: order.client_id },
        data: {
          points_balance: {
            increment: order.points_generated,
          },
        },
      });

      // Create points transaction record
      await tx.pointsTransaction.create({
        data: {
          client_id: order.client_id,
          points: order.points_generated,
          type: 'gain',
          description: `Points earned from order #${order.id}`,
          order_id: order.id,
        },
      });

      return updatedOrder;
    });
  }
}

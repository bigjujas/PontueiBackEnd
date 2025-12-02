import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  CreatePaymentDto 
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  @ApiResponse({ status: 404, description: 'Establishment or products not found' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findMyOrders(@Request() req) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Get('my-store')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store orders (owner only)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not store owner' })
  @ApiResponse({ status: 404, description: 'Establishment not found' })
  async findStoreOrders(@Request() req) {
    return this.ordersService.findStoreOrders(req.user.id);
  }

  @Put(':orderId/status')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (owner only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not store owner' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user.id, orderId, updateOrderStatusDto);
  }

  @Post(':orderId/payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment for order' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPayment(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.ordersService.createPayment(req.user.id, orderId, createPaymentDto);
  }

  @Post(':orderId/complete')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete order and award points (owner only)' })
  @ApiResponse({ status: 200, description: 'Order completed successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not store owner' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async completeOrder(
    @Request() req,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.completeOrder(req.user.id, orderId);
  }
}

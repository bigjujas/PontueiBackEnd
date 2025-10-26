import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstablishmentDto, UpdateEstablishmentDto, CreateProductDto, UpdateProductDto } from './dto/establishment.dto';

@Injectable()
export class EstablishmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, search?: string) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return this.prisma.establishment.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        address: true,
        logo_url: true,
        cover_url: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        address: true,
        logo_url: true,
        cover_url: true,
        created_at: true,
      },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    // Get products for this establishment
    const products = await this.prisma.product.findMany({
      where: { 
        establishment_id: id,
        is_active: true 
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        photo_url: true,
        created_at: true,
      },
    });

    return {
      ...establishment,
      products,
    };
  }

  async findMyStore(clientId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    // Get products for this establishment
    const products = await this.prisma.product.findMany({
      where: { establishment_id: establishment.id },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      ...establishment,
      products,
    };
  }

  async updateMyStore(clientId: string, updateEstablishmentDto: UpdateEstablishmentDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const updatedEstablishment = await this.prisma.establishment.update({
      where: { id: establishment.id },
      data: updateEstablishmentDto,
    });

    // Get products for this establishment
    const products = await this.prisma.product.findMany({
      where: { establishment_id: establishment.id },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      ...updatedEstablishment,
      products,
    };
  }

  // Product CRUD operations
  async createProduct(clientId: string, createProductDto: CreateProductDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        price: parseFloat(createProductDto.price),
        establishment_id: establishment.id,
      },
    });
  }

  async updateProduct(clientId: string, productId: string, updateProductDto: UpdateProductDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        establishment_id: establishment.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.price) {
      updateData.price = parseFloat(updateProductDto.price);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }

  async deleteProduct(clientId: string, productId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { owner_client_id: clientId },
    });

    if (!establishment) {
      throw new NotFoundException('You do not own any establishment');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        establishment_id: establishment.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}

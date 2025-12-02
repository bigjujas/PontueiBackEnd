import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClientDto } from '../auth/dto/auth.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findMe(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        date_of_birth: true,
        points_balance: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async updateMe(clientId: string, updateClientDto: UpdateClientDto) {
    const { password, email, ...rest } = updateClientDto;

    // Check if email is being updated and if it already exists
    if (email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          email,
          id: { not: clientId },
        },
      });

      if (existingClient) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = { ...rest };

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedClient = await this.prisma.client.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        date_of_birth: true,
        points_balance: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updatedClient;
  }

  async getEstablishmentPoints(clientId: string, establishmentId: string) {
    // Buscar transações de pontos para este cliente e estabelecimento
    const transactions = await this.prisma.pointsTransaction.findMany({
      where: {
        client_id: clientId,
        order: {
          establishment_id: establishmentId,
        },
      },
    });

    // Calcular saldo de pontos para este estabelecimento
    const totalPoints = transactions.reduce((sum, transaction) => {
      return transaction.type === 'gain' ? sum + transaction.points : sum - transaction.points;
    }, 0);

    return {
      clientId,
      establishmentId,
      points: Math.max(0, totalPoints), // Não permitir pontos negativos
    };
  }

  async getPointsFromOrders(clientId: string, establishmentId: string) {
    // Buscar todos os pedidos do cliente neste estabelecimento
    const orders = await this.prisma.order.findMany({
      where: {
        client_id: clientId,
        establishment_id: establishmentId,
      },
    });

    // Somar todos os pontos gerados pelos pedidos
    const totalPoints = orders.reduce((sum, order) => {
      return sum + (order.points_generated || 0);
    }, 0);

    return {
      clientId,
      establishmentId,
      points: totalPoints,
      ordersCount: orders.length,
    };
  }
}

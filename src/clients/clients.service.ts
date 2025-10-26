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
}

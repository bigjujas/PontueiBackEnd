import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, cpf, password, ...rest } = registerDto;

    // Check if email already exists
    const existingEmail = await this.prisma.client.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if CPF already exists
    const existingCpf = await this.prisma.client.findUnique({
      where: { cpf },
    });

    if (existingCpf) {
      throw new ConflictException('CPF already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client
    const client = await this.prisma.client.create({
      data: {
        ...rest,
        email,
        cpf,
        password_hash: hashedPassword,
        date_of_birth: new Date(registerDto.date_of_birth),
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        date_of_birth: true,
        points_balance: true,
        created_at: true,
      },
    });

    // Generate JWT
    const payload = { sub: client.id, email: client.email };
    const token = this.jwtService.sign(payload);

    return {
      client,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find client by email
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, client.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: client.id, email: client.email };
    const token = this.jwtService.sign(payload);

    return {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        cpf: client.cpf,
        date_of_birth: client.date_of_birth,
        points_balance: client.points_balance,
        created_at: client.created_at,
      },
      access_token: token,
    };
  }

  async validateUser(email: string, password: string) {
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (client && await bcrypt.compare(password, client.password_hash)) {
      const { password_hash: _, ...result } = client;
      return result;
    }

    return null;
  }
}

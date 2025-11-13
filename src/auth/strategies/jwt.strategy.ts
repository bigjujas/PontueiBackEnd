import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const client = await this.prisma.client.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        points_balance: true,
        is_establishment_owner: true,
      },
    });

    if (!client) {
      throw new UnauthorizedException();
    }

    return {
      sub: payload.sub,
      id: client.id,
      email: client.email,
      name: client.name,
      points_balance: client.points_balance,
      is_establishment_owner: client.is_establishment_owner,
    };
  }
}

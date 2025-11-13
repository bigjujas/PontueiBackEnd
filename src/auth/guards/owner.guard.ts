import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const establishmentId = request.params.id || request.params.establishmentId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user owns an establishment
    const establishment = await this.prisma.establishment.findFirst({
      where: {
        owner_client_id: user.sub || user.id,
      },
    });

    if (!establishment) {
      throw new ForbiddenException('User does not own any establishment');
    }

    // If establishmentId is provided, check if it belongs to the user
    if (establishmentId && establishment.id !== establishmentId) {
      throw new ForbiddenException('User does not own this establishment');
    }

    // Add establishment to request for use in controllers
    request.establishment = establishment;
    return true;
  }
}

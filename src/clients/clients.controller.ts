import { Controller, Get, Put, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from '../auth/dto/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current client profile' })
  @ApiResponse({ status: 200, description: 'Client profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMe(@Request() req) {
    return this.clientsService.findMe(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current client profile' })
  @ApiResponse({ status: 200, description: 'Client profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateMe(@Request() req, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.updateMe(req.user.id, updateClientDto);
  }

  @Get('points/:clientId/:establishmentId')
  @ApiOperation({ summary: 'Get client points for specific establishment' })
  @ApiResponse({ status: 200, description: 'Points retrieved successfully' })
  async getEstablishmentPoints(
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.clientsService.getEstablishmentPoints(clientId, establishmentId);
  }

  @Get('points-from-orders/:clientId/:establishmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client points from orders for specific establishment' })
  @ApiResponse({ status: 200, description: 'Points calculated from orders' })
  async getPointsFromOrders(
    @Param('clientId') clientId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.clientsService.getPointsFromOrders(clientId, establishmentId);
  }

  @Get('all-points/:clientId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all client points grouped by establishment' })
  @ApiResponse({ status: 200, description: 'All points by establishment' })
  async getAllUserPoints(
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.getAllUserPoints(clientId);
  }

  @Get('establishment-ranking/:establishmentId')
  @ApiOperation({ summary: 'Get establishment user ranking' })
  @ApiResponse({ status: 200, description: 'User ranking for establishment' })
  async getEstablishmentRanking(
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.clientsService.getEstablishmentRanking(establishmentId);
  }
}

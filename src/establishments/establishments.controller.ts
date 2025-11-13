import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery 
} from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { 
  CreateEstablishmentDto, 
  UpdateEstablishmentDto, 
  CreateProductDto, 
  UpdateProductDto 
} from './dto/establishment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';

@ApiTags('Establishments')
@Controller('establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all establishments' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiResponse({ status: 200, description: 'Establishments retrieved successfully' })
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.establishmentsService.findAll(category, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get establishment by ID' })
  @ApiResponse({ status: 200, description: 'Establishment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Establishment not found' })
  async findOne(@Param('id') id: string) {
    return this.establishmentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new establishment' })
  @ApiResponse({ status: 201, description: 'Establishment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'User already owns an establishment' })
  async create(
    @Request() req,
    @Body() createEstablishmentDto: CreateEstablishmentDto,
  ) {
    return this.establishmentsService.create(req.user.sub, createEstablishmentDto);
  }

  @Get('my-store')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my establishment' })
  @ApiResponse({ status: 200, description: 'Establishment retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Establishment not found' })
  async findMyStore(@Request() req) {
    return this.establishmentsService.findMyStore(req.user.sub);
  }

  @Put('my-store')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my establishment' })
  @ApiResponse({ status: 200, description: 'Establishment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Establishment not found' })
  async updateMyStore(
    @Request() req,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
  ) {
    return this.establishmentsService.updateMyStore(req.user.sub, updateEstablishmentDto);
  }

  // Product CRUD endpoints
  @Post('my-store/products')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Establishment not found' })
  async createProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.establishmentsService.createProduct(req.user.sub, createProductDto);
  }

  @Put('my-store/products/:productId')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.establishmentsService.updateProduct(req.user.sub, productId, updateProductDto);
  }

  @Delete('my-store/products/:productId')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Request() req,
    @Param('productId') productId: string,
  ) {
    return this.establishmentsService.deleteProduct(req.user.sub, productId);
  }
}

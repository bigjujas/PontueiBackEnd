import { IsString, IsOptional, IsArray, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstablishmentDto {
  @ApiProperty({ example: 'Restaurante do João' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Restaurante especializado em comida brasileira', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Restaurante' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  address: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'contato@restaurante.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: ['https://example.com/photo1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}

export class UpdateEstablishmentDto {
  @ApiProperty({ example: 'Restaurante do João Santos', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Restaurante especializado em comida brasileira e internacional', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Restaurante', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Rua das Flores, 456', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '(11) 88888-8888', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'contato@restaurante.com.br', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Prato Feito' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Arroz, feijão, carne e salada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25.50 })
  @IsString()
  price: string;

  @ApiProperty({ example: 'Pratos Principais', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Prato Feito Especial', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Arroz, feijão, carne especial e salada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30.00, required: false })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiProperty({ example: 'Pratos Principais', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

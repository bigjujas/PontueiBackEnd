import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'product-id-123' })
  @IsString()
  product_id: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'establishment-id-123' })
  @IsString()
  establishment_id: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'confirmed' })
  @IsString()
  status: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 25.50 })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'pix' })
  @IsString()
  method: string;
}

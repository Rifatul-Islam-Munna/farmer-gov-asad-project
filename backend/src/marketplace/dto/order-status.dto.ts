import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderStatusDto {
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ])
  status!:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

  @IsOptional()
  @IsString()
  @MaxLength(160)
  trackingNumber?: string;
}

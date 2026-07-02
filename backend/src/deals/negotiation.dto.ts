import { IsNumber, IsString, Min } from 'class-validator';

export class CreateNegotiationDto {
  @IsString()
  listingId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class UpdateNegotiationDto {
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

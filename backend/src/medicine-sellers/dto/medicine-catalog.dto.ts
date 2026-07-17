import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpsertMedicineDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsIn(['medicine', 'pesticide', 'fertilizer'])
  type: 'medicine' | 'pesticide' | 'fertilizer';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

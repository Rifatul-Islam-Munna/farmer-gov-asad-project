import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateIntegrationSettingsDto {
  @ApiProperty({
    type: [String],
    description: 'One or more Gemini API keys. Values are encrypted at rest.',
  })
  @IsArray()
  @IsString({ each: true })
  @MinLength(10, { each: true })
  geminiApiKeys!: string[];

  @ApiPropertyOptional({
    description: 'Gemini model used for text generation.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  geminiTextModel?: string;

  @ApiPropertyOptional({
    description: 'Gemini model used for image/vision analysis.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  geminiVisionModel?: string;

  @ApiPropertyOptional({
    description: 'Provider used to create vectors for Qdrant image matching.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  imageEmbeddingProvider?: string;

  @ApiPropertyOptional({ description: 'Image embedding model identifier.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  imageEmbeddingModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  windyApiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  oneSignalAppId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  oneSignalRestApiKey?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

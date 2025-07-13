import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum VaultCategory {
  STABLE = 'stable',
  YIELD = 'yield',
  GROWTH = 'growth',
}

export class VaultFilterDto {
  @ApiPropertyOptional({ description: 'Search term for vault name or protocol' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    enum: RiskLevel, 
    description: 'Filter by risk level',
    enumName: 'RiskLevel'
  })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ 
    enum: VaultCategory, 
    description: 'Filter by vault category',
    enumName: 'VaultCategory'
  })
  @IsOptional()
  @IsEnum(VaultCategory)
  category?: VaultCategory;

  @ApiPropertyOptional({ description: 'Minimum APY percentage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAPY?: number;

  @ApiPropertyOptional({ description: 'Maximum APY percentage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAPY?: number;

  @ApiPropertyOptional({ description: 'Filter by protocol name' })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiPropertyOptional({ description: 'Only show active vaults', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean = true;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'apy' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'apy';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
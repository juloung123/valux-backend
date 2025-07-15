import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class RuleFilterDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Filter by vault ID',
    example: 'vault123',
    required: false,
  })
  @IsOptional()
  @IsString()
  vaultId?: string;

  @ApiProperty({
    description: 'Filter by trigger type',
    example: 'monthly',
    enum: ['weekly', 'monthly', 'quarterly', 'profit_threshold'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly', 'profit_threshold'])
  trigger?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Search by rule name',
    example: 'Monthly Distribution',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Include execution history',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeExecutions?: boolean;
}

export class RuleListResponseDto {
  @ApiProperty({
    description: 'Array of rules',
    type: 'array',
    items: { $ref: '#/components/schemas/RuleDto' },
  })
  rules!: any[];

  @ApiProperty({
    description: 'Total number of rules',
    example: 5,
  })
  total!: number;

  @ApiProperty({
    description: 'Active rules count',
    example: 3,
  })
  activeCount!: number;

  @ApiProperty({
    description: 'Inactive rules count',
    example: 2,
  })
  inactiveCount!: number;
}
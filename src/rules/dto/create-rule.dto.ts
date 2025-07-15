import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateDistributionDto {
  @ApiProperty({
    description: 'Recipient wallet address or "reinvest"',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @ApiProperty({
    description: 'Percentage of profit to distribute (0-100)',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;

  @ApiProperty({
    description: 'Optional description for this distribution',
    example: 'Emergency fund allocation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Distribution type',
    example: 'wallet',
    enum: ['wallet', 'reinvest'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['wallet', 'reinvest'])
  type?: string = 'wallet';
}

export class CreateRuleDto {
  @ApiProperty({
    description: 'Rule name',
    example: 'Monthly Profit Distribution',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Rule description',
    example: 'Distribute profits monthly to multiple wallets',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Vault ID to apply this rule to',
    example: 'vault123',
  })
  @IsString()
  @IsNotEmpty()
  vaultId!: string;

  @ApiProperty({
    description: 'Rule trigger type',
    example: 'monthly',
    enum: ['weekly', 'monthly', 'quarterly', 'profit_threshold'],
  })
  @IsEnum(['weekly', 'monthly', 'quarterly', 'profit_threshold'])
  trigger!: string;

  @ApiProperty({
    description: 'Profit threshold amount (required for profit_threshold trigger)',
    example: '1000.50',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString())
  profitThreshold?: string;

  @ApiProperty({
    description: 'Distribution settings',
    type: [CreateDistributionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDistributionDto)
  distributions!: CreateDistributionDto[];

  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  userAddress!: string;
}
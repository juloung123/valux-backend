import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateDistributionDto } from './create-rule.dto';

export class UpdateRuleDto {
  @ApiProperty({
    description: 'Rule name',
    example: 'Monthly Profit Distribution',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Rule description',
    example: 'Updated description for profit distribution',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Rule trigger type',
    example: 'monthly',
    enum: ['weekly', 'monthly', 'quarterly', 'profit_threshold'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly', 'profit_threshold'])
  trigger?: string;

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
    description: 'Rule active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Distribution settings',
    type: [CreateDistributionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDistributionDto)
  distributions?: CreateDistributionDto[];
}
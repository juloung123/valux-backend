import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PortfolioExportQueryDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Export format',
    example: 'csv',
    enum: ['csv', 'json', 'pdf'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['csv', 'json', 'pdf'])
  format?: string = 'csv';

  @ApiProperty({
    description: 'Tax year for export',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  year?: number;

  @ApiProperty({
    description: 'Start date for export',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for export',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Include only taxable events',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  taxableOnly?: boolean = false;
}

export class PortfolioExportResponseDto {
  @ApiProperty({
    description: 'Export file URL or data',
    example: 'https://api.valux.finance/exports/portfolio-2024-tax-export.csv',
  })
  downloadUrl?: string;

  @ApiProperty({
    description: 'Export data (for JSON format)',
    example: {
      summary: {},
      transactions: [],
      taxSummary: {},
    },
  })
  data?: any;

  @ApiProperty({
    description: 'Export metadata',
    example: {
      format: 'csv',
      generatedAt: '2025-07-13T10:30:00Z',
      totalRecords: 150,
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z',
      },
    },
  })
  metadata!: {
    format: string;
    generatedAt: string;
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PortfolioOverviewDto {
  @ApiProperty({
    description: 'Total value of all positions',
    example: '15000.50',
  })
  totalValue!: string;

  @ApiProperty({
    description: 'Total amount deposited',
    example: '12000.00',
  })
  totalDeposited!: string;

  @ApiProperty({
    description: 'Total unrealized profit/loss',
    example: '2500.30',
  })
  totalUnrealizedPnl!: string;

  @ApiProperty({
    description: 'Total realized profit/loss',
    example: '500.20',
  })
  totalRealizedPnl!: string;

  @ApiProperty({
    description: 'Total distributed profits',
    example: '1200.00',
  })
  totalDistributed!: string;

  @ApiProperty({
    description: 'Average APY across all positions',
    example: 8.5,
  })
  avgAPY!: number;

  @ApiProperty({
    description: 'Portfolio performance over time periods',
    example: {
      '24h': 2.5,
      '7d': 5.2,
      '30d': 12.8,
      '1y': 45.6,
    },
  })
  performance!: {
    '24h': number;
    '7d': number;
    '30d': number;
    '1y': number;
  };

  @ApiProperty({
    description: 'Number of active positions',
    example: 3,
  })
  activePositions!: number;

  @ApiProperty({
    description: 'Number of active rules',
    example: 2,
  })
  activeRules!: number;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  lastUpdated!: string;
}

export class PortfolioQueryDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Include historical performance data',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeHistory?: boolean;
}
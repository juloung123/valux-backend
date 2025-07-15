import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export class TvlMetricsQueryDto {
  @ApiProperty({
    description: 'Time frame for TVL metrics',
    example: '24h',
    enum: ['24h', '7d', '30d', '1y'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '1y'])
  timeframe?: string = '24h';
}

export class TvlDataPointDto {
  @ApiProperty({
    description: 'Timestamp',
    example: '2025-07-14T16:30:00Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'TVL value at this timestamp',
    example: '48500000.00',
  })
  tvl!: string;

  @ApiProperty({
    description: 'Change from previous data point',
    example: 2.5,
  })
  change!: number;
}

export class TvlMetricsDto {
  @ApiProperty({
    description: 'Current TVL',
    example: '50000000.00',
  })
  current!: string;

  @ApiProperty({
    description: 'TVL at the start of the timeframe',
    example: '47500000.00',
  })
  startValue!: string;

  @ApiProperty({
    description: 'Total change in TVL',
    example: 2500000.00,
  })
  totalChange!: number;

  @ApiProperty({
    description: 'Percentage change',
    example: 5.26,
  })
  percentageChange!: number;

  @ApiProperty({
    description: 'Highest TVL in the timeframe',
    example: '51000000.00',
  })
  peak!: string;

  @ApiProperty({
    description: 'Lowest TVL in the timeframe',
    example: '47000000.00',
  })
  low!: string;

  @ApiProperty({
    description: 'Historical TVL data points',
    type: [TvlDataPointDto],
  })
  history!: TvlDataPointDto[];

  @ApiProperty({
    description: 'Timeframe for these metrics',
    example: '24h',
    enum: ['24h', '7d', '30d', '1y'],
  })
  timeframe!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T16:30:00Z',
  })
  lastUpdated!: string;
}
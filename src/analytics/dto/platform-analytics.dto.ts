import { ApiProperty } from '@nestjs/swagger';

export class PlatformAnalyticsDto {
  @ApiProperty({
    description: 'Total Value Locked across all vaults',
    example: {
      current: '50000000.00',
      change24h: 2500000.00,
      changePercentage: 5.26,
    },
  })
  tvl!: {
    current: string;
    change24h: number;
    changePercentage: number;
  };

  @ApiProperty({
    description: 'User statistics',
    example: {
      total: 1250,
      active24h: 89,
      growth: 12.5,
    },
  })
  users!: {
    total: number;
    active24h: number;
    growth: number;
  };

  @ApiProperty({
    description: 'Transaction statistics',
    example: {
      total: 5678,
      volume24h: '1250000.00',
      fees24h: '6250.00',
    },
  })
  transactions!: {
    total: number;
    volume24h: string;
    fees24h: string;
  };

  @ApiProperty({
    description: 'Yield and distribution statistics',
    example: {
      averageAPY: 8.75,
      totalDistributed: '2500000.00',
      totalFeesGenerated: '125000.00',
    },
  })
  yields!: {
    averageAPY: number;
    totalDistributed: string;
    totalFeesGenerated: string;
  };

  @ApiProperty({
    description: 'Rules and automation statistics',
    example: {
      totalRules: 456,
      activeRules: 342,
      executionsToday: 28,
    },
  })
  rules!: {
    totalRules: number;
    activeRules: number;
    executionsToday: number;
  };

  @ApiProperty({
    description: 'Protocol distribution',
    example: {
      aave: { tvl: '20000000.00', percentage: 40 },
      compound: { tvl: '15000000.00', percentage: 30 },
      lido: { tvl: '10000000.00', percentage: 20 },
      curve: { tvl: '5000000.00', percentage: 10 },
    },
  })
  protocols!: {
    [key: string]: {
      tvl: string;
      percentage: number;
    };
  };

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T16:30:00Z',
  })
  lastUpdated!: string;
}
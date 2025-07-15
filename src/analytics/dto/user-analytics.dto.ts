import { ApiProperty } from '@nestjs/swagger';

export class UserAnalyticsDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  userAddress!: string;

  @ApiProperty({
    description: 'User join date',
    example: '2024-01-15T10:00:00Z',
  })
  joinedAt!: string;

  @ApiProperty({
    description: 'Portfolio summary',
    example: {
      totalValue: '15000.00',
      totalDeposited: '12000.00',
      totalPnl: '3000.00',
      activePositions: 3,
    },
  })
  portfolio!: {
    totalValue: string;
    totalDeposited: string;
    totalPnl: string;
    activePositions: number;
  };

  @ApiProperty({
    description: 'Rules and automation statistics',
    example: {
      totalRules: 5,
      activeRules: 3,
      totalExecutions: 28,
      totalDistributed: '2500.00',
    },
  })
  rules!: {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    totalDistributed: string;
  };

  @ApiProperty({
    description: 'Transaction statistics',
    example: {
      totalTransactions: 45,
      totalVolume: '25000.00',
      totalFees: '125.00',
    },
  })
  transactions!: {
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
  };

  @ApiProperty({
    description: 'Performance metrics',
    example: {
      averageAPY: 8.5,
      bestPerformingVault: {
        name: 'Aave USDC Vault',
        apy: 12.3,
        returns: '1500.00',
      },
      totalReturns: '3000.00',
    },
  })
  performance!: {
    averageAPY: number;
    bestPerformingVault: {
      name: string;
      apy: number;
      returns: string;
    };
    totalReturns: string;
  };

  @ApiProperty({
    description: 'Activity timeline',
    example: {
      lastActivity: '2025-07-14T16:30:00Z',
      daysActive: 127,
      avgTransactionsPerDay: 0.35,
    },
  })
  activity!: {
    lastActivity: string;
    daysActive: number;
    avgTransactionsPerDay: number;
  };

  @ApiProperty({
    description: 'Rankings and achievements',
    example: {
      tvlRank: 15,
      returnsRank: 8,
      automationRank: 3,
      badges: ['Early Adopter', 'Automation Expert'],
    },
  })
  rankings!: {
    tvlRank: number;
    returnsRank: number;
    automationRank: number;
    badges: string[];
  };

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T16:30:00Z',
  })
  lastUpdated!: string;
}
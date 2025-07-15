import { ApiProperty } from '@nestjs/swagger';

export class PortfolioPositionDto {
  @ApiProperty({
    description: 'Position ID',
    example: 'clxxxxx1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Vault information',
    example: {
      id: 'vault123',
      name: 'Aave USDC Vault',
      protocol: 'aave',
      tokenSymbol: 'USDC',
      riskLevel: 'low',
      category: 'stable',
      currentAPY: 5.25,
    },
  })
  vault!: {
    id: string;
    name: string;
    protocol: string;
    tokenSymbol: string;
    riskLevel: string;
    category: string;
    currentAPY: number;
  };

  @ApiProperty({
    description: 'Total amount deposited',
    example: '5000.00',
  })
  depositAmount!: string;

  @ApiProperty({
    description: 'Current value of position',
    example: '5200.50',
  })
  currentValue!: string;

  @ApiProperty({
    description: 'Unrealized profit/loss',
    example: '200.50',
  })
  unrealizedPnl!: string;

  @ApiProperty({
    description: 'Realized profit/loss',
    example: '150.00',
  })
  realizedPnl!: string;

  @ApiProperty({
    description: 'Total distributed profits',
    example: '100.00',
  })
  totalDistributed!: string;

  @ApiProperty({
    description: 'Average APY for this position',
    example: 5.8,
  })
  avgAPY!: number;

  @ApiProperty({
    description: 'First deposit date',
    example: '2024-01-15T10:00:00Z',
  })
  firstDepositAt!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  lastUpdated!: string;

  @ApiProperty({
    description: 'Number of active rules for this position',
    example: 1,
  })
  activeRules!: number;

  @ApiProperty({
    description: 'Performance percentage',
    example: 4.01,
  })
  performancePercentage!: number;
}
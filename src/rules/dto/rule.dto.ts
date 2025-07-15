import { ApiProperty } from '@nestjs/swagger';

export class DistributionDto {
  @ApiProperty({
    description: 'Distribution ID',
    example: 'dist123',
  })
  id!: string;

  @ApiProperty({
    description: 'Recipient wallet address or "reinvest"',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  recipient!: string;

  @ApiProperty({
    description: 'Percentage of profit to distribute (0-100)',
    example: 50,
  })
  percentage!: number;

  @ApiProperty({
    description: 'Optional description for this distribution',
    example: 'Emergency fund allocation',
  })
  description?: string;

  @ApiProperty({
    description: 'Distribution type',
    example: 'wallet',
    enum: ['wallet', 'reinvest'],
  })
  type!: string;
}

export class RuleDto {
  @ApiProperty({
    description: 'Rule ID',
    example: 'rule123',
  })
  id!: string;

  @ApiProperty({
    description: 'Rule name',
    example: 'Monthly Profit Distribution',
  })
  name!: string;

  @ApiProperty({
    description: 'Rule description',
    example: 'Distribute profits monthly to multiple wallets',
  })
  description?: string;

  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  userAddress!: string;

  @ApiProperty({
    description: 'Vault information',
    example: {
      id: 'vault123',
      name: 'Aave USDC Vault',
      protocol: 'aave',
      tokenSymbol: 'USDC',
    },
  })
  vault!: {
    id: string;
    name: string;
    protocol: string;
    tokenSymbol: string;
  };

  @ApiProperty({
    description: 'Rule trigger type',
    example: 'monthly',
    enum: ['weekly', 'monthly', 'quarterly', 'profit_threshold'],
  })
  trigger!: string;

  @ApiProperty({
    description: 'Profit threshold amount (for profit_threshold trigger)',
    example: '1000.50',
  })
  profitThreshold?: string;

  @ApiProperty({
    description: 'Rule active status',
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: 'Last execution timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  lastExecuted?: string;

  @ApiProperty({
    description: 'Next execution timestamp',
    example: '2025-08-13T10:30:00Z',
  })
  nextExecution?: string;

  @ApiProperty({
    description: 'Distribution settings',
    type: [DistributionDto],
  })
  distributions!: DistributionDto[];

  @ApiProperty({
    description: 'Rule creation timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Rule last update timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'Total executions count',
    example: 5,
  })
  executionsCount!: number;

  @ApiProperty({
    description: 'Total profit distributed',
    example: '2500.00',
  })
  totalDistributed!: string;
}
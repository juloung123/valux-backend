import { ApiProperty } from '@nestjs/swagger';

export class RuleExecutionDto {
  @ApiProperty({
    description: 'Execution ID',
    example: 'exec123',
  })
  id!: string;

  @ApiProperty({
    description: 'Rule ID',
    example: 'rule123',
  })
  ruleId!: string;

  @ApiProperty({
    description: 'Execution timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  executedAt!: string;

  @ApiProperty({
    description: 'Profit amount distributed',
    example: '500.00',
  })
  profitAmount!: string;

  @ApiProperty({
    description: 'Gas used for execution',
    example: '0.005',
  })
  gasUsed?: string;

  @ApiProperty({
    description: 'Gas fee paid',
    example: '0.001',
  })
  gasFee?: string;

  @ApiProperty({
    description: 'Transaction hashes and details',
    example: [
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
        amount: '250.00',
        status: 'confirmed',
      },
    ],
  })
  transactions!: any[];

  @ApiProperty({
    description: 'Execution status',
    example: 'completed',
    enum: ['completed', 'failed', 'pending'],
  })
  status!: string;

  @ApiProperty({
    description: 'Error message if failed',
    example: null,
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Platform performance fee',
    example: '2.50',
  })
  performanceFee?: string;
}

export class ExecuteRuleResponseDto {
  @ApiProperty({
    description: 'Execution result',
    example: 'success',
    enum: ['success', 'error', 'insufficient_profit'],
  })
  result!: string;

  @ApiProperty({
    description: 'Execution details',
    type: RuleExecutionDto,
  })
  execution?: RuleExecutionDto;

  @ApiProperty({
    description: 'Error message if failed',
    example: null,
  })
  message?: string;

  @ApiProperty({
    description: 'Execution timestamp',
    example: '2025-07-13T10:30:00Z',
  })
  timestamp!: string;
}
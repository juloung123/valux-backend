import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'clxxxxx1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Transaction hash on blockchain',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  hash!: string;

  @ApiProperty({
    description: 'Transaction type',
    example: 'deposit',
    enum: ['deposit', 'withdrawal', 'distribution', 'reinvest'],
  })
  type!: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: '1000.50',
  })
  amount!: string;

  @ApiProperty({
    description: 'Token symbol',
    example: 'USDC',
  })
  tokenSymbol!: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'failed'],
  })
  status!: string;

  @ApiProperty({
    description: 'Block number',
    example: 123456789,
  })
  blockNumber!: number;

  @ApiProperty({
    description: 'Gas used',
    example: '21000',
  })
  gasUsed!: string;

  @ApiProperty({
    description: 'Gas fee paid',
    example: '0.005',
  })
  gasFee!: string;

  @ApiProperty({
    description: 'From address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  fromAddress!: string;

  @ApiProperty({
    description: 'To address',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  toAddress!: string;

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
    description: 'Transaction execution time',
    example: '2025-07-13T10:30:00Z',
  })
  executedAt!: string;

  @ApiProperty({
    description: 'Transaction confirmation time',
    example: '2025-07-13T10:32:00Z',
  })
  confirmedAt!: string;
}

export class TransactionQueryDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Filter by transaction type',
    example: 'deposit',
    enum: ['deposit', 'withdrawal', 'distribution', 'reinvest'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['deposit', 'withdrawal', 'distribution', 'reinvest'])
  type?: string;

  @ApiProperty({
    description: 'Filter by vault ID',
    example: 'vault123',
    required: false,
  })
  @IsOptional()
  @IsString()
  vaultId?: string;

  @ApiProperty({
    description: 'Filter by status',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'failed'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'failed'])
  status?: string;

  @ApiProperty({
    description: 'Start date filter',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date filter',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 20;
}

export class TransactionListResponseDto {
  @ApiProperty({
    description: 'Array of transactions',
    type: [TransactionDto],
  })
  transactions!: TransactionDto[];

  @ApiProperty({
    description: 'Total number of transactions',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total pages',
    example: 8,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Has more pages',
    example: true,
  })
  hasMore!: boolean;
}
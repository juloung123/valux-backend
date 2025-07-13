import { ApiProperty } from '@nestjs/swagger';

export class VaultDto {
  @ApiProperty({ description: 'Vault unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Vault display name' })
  name!: string;

  @ApiProperty({ description: 'Smart contract address' })
  address!: string;

  @ApiProperty({ description: 'Protocol name (aave, compound, lido, etc.)' })
  protocol!: string;

  @ApiProperty({ description: 'Token contract address' })
  tokenAddress!: string;

  @ApiProperty({ description: 'Token symbol (USDC, ETH, DAI, etc.)' })
  tokenSymbol!: string;

  @ApiProperty({ description: 'Annual percentage yield' })
  apy!: number;

  @ApiProperty({ description: 'Risk level', enum: ['low', 'medium', 'high'] })
  riskLevel!: string;

  @ApiProperty({ description: 'Vault category', enum: ['stable', 'yield', 'growth'] })
  category!: string;

  @ApiProperty({ description: 'Total value locked in vault' })
  tvl!: string;

  @ApiProperty({ description: 'Whether vault is currently active' })
  active!: boolean;

  @ApiProperty({ description: 'Insurance coverage available' })
  insuranceAvailable!: boolean;

  @ApiProperty({ description: 'Auto-compounding enabled' })
  autoCompounding!: boolean;

  @ApiProperty({ description: 'Withdrawal terms (instant, 7days, 30days)', nullable: true })
  withdrawalTerms!: string | null;

  @ApiProperty({ description: 'Vault creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

export class VaultListResponseDto {
  @ApiProperty({ type: [VaultDto], description: 'List of vaults' })
  vaults!: VaultDto[];

  @ApiProperty({ description: 'Total number of vaults matching filters' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;
}
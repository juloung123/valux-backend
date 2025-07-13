import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { VaultFilterDto, VaultDto, VaultListResponseDto } from './dto';
import { Vault } from '@prisma/client';
import { ResourceNotFoundException, BusinessException } from '@/common/exceptions/exceptions';

@Injectable()
export class VaultsService {
  private readonly logger = new Logger(VaultsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filterDto: VaultFilterDto): Promise<VaultListResponseDto> {
    try {
      const {
        search,
        riskLevel,
        category,
        minAPY,
        maxAPY,
        protocol,
        active = true,
        page = 1,
        limit = 20,
        sortBy = 'apy',
        sortOrder = 'desc',
      } = filterDto;

      // Validate pagination parameters
      if (page < 1) {
        throw new BusinessException('Page number must be greater than 0');
      }
      
      if (limit < 1 || limit > 100) {
        throw new BusinessException('Limit must be between 1 and 100');
      }

      // Validate APY range
      if (minAPY !== undefined && minAPY < 0) {
        throw new BusinessException('Minimum APY cannot be negative');
      }
      
      if (maxAPY !== undefined && maxAPY < 0) {
        throw new BusinessException('Maximum APY cannot be negative');
      }
      
      if (minAPY !== undefined && maxAPY !== undefined && minAPY > maxAPY) {
        throw new BusinessException('Minimum APY cannot be greater than maximum APY');
      }

      const whereFilter: Partial<VaultFilterDto> = {
        ...(search !== undefined && { search }),
        ...(riskLevel !== undefined && { riskLevel }),
        ...(category !== undefined && { category }),
        ...(minAPY !== undefined && { minAPY }),
        ...(maxAPY !== undefined && { maxAPY }),
        ...(protocol !== undefined && { protocol }),
        active,
      };
      const where = this.buildWhereClause(whereFilter);

      const orderBy = this.buildOrderByClause(sortBy, sortOrder);
      const skip = (page - 1) * limit;

      this.logger.debug(`Fetching vaults with filters: ${JSON.stringify(filterDto)}`);

      // Execute queries in parallel
      const [vaults, total] = await Promise.all([
        this.prisma.vault.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.vault.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Retrieved ${vaults.length} vaults (page ${page}/${totalPages})`);

      return {
        vaults: vaults.map(vault => this.transformVaultToDto(vault)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to fetch vaults: ${errorMessage}`, errorStack);
      
      if (error instanceof BusinessException) {
        throw error;
      }
      
      throw new BusinessException('Failed to retrieve vaults');
    }
  }

  private buildWhereClause(filters: Partial<VaultFilterDto>): any {
    const where: any = {};
    const { search, riskLevel, category, minAPY, maxAPY, protocol, active } = filters;

    if (active !== undefined) {
      where.active = active;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { protocol: { contains: search.trim(), mode: 'insensitive' } },
        { tokenSymbol: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    if (category) {
      where.category = category;
    }

    if (protocol?.trim()) {
      where.protocol = { contains: protocol.trim(), mode: 'insensitive' };
    }

    if (minAPY !== undefined || maxAPY !== undefined) {
      where.apy = {};
      if (minAPY !== undefined) {
        where.apy.gte = minAPY;
      }
      if (maxAPY !== undefined) {
        where.apy.lte = maxAPY;
      }
    }

    return where;
  }

  private buildOrderByClause(sortBy?: string, sortOrder?: string): any {
    const validSortFields = ['apy', 'tvl', 'name', 'createdAt'];
    const validSortOrders = ['asc', 'desc'];

    const field = validSortFields.includes(sortBy ?? '') ? sortBy : 'apy';
    const order = validSortOrders.includes(sortOrder ?? '') ? sortOrder : 'desc';

    return { [field as string]: order };
  }

  async findOne(id: string): Promise<VaultDto> {
    try {
      if (!id?.trim()) {
        throw new BusinessException('Vault ID is required');
      }

      this.logger.debug(`Fetching vault with ID: ${id}`);

      const vault = await this.prisma.vault.findUnique({
        where: { id: id.trim() },
      });

      if (!vault) {
        throw new ResourceNotFoundException('Vault', id);
      }

      this.logger.log(`Retrieved vault: ${vault.name} (${vault.id})`);
      return this.transformVaultToDto(vault);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to fetch vault ${id}: ${errorMessage}`, errorStack);
      
      if (error instanceof ResourceNotFoundException || error instanceof BusinessException) {
        throw error;
      }
      
      throw new BusinessException(`Failed to retrieve vault with ID ${id}`);
    }
  }

  async findByAddress(address: string): Promise<VaultDto> {
    try {
      if (!address?.trim()) {
        throw new BusinessException('Vault address is required');
      }

      // Basic Ethereum address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
        throw new BusinessException('Invalid Ethereum address format');
      }

      this.logger.debug(`Fetching vault with address: ${address}`);

      const vault = await this.prisma.vault.findUnique({
        where: { address: address.trim().toLowerCase() },
      });

      if (!vault) {
        throw new ResourceNotFoundException('Vault', address);
      }

      this.logger.log(`Retrieved vault: ${vault.name} (${vault.address})`);
      return this.transformVaultToDto(vault);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to fetch vault ${address}: ${errorMessage}`, errorStack);
      
      if (error instanceof ResourceNotFoundException || error instanceof BusinessException) {
        throw error;
      }
      
      throw new BusinessException(`Failed to retrieve vault with address ${address}`);
    }
  }

  async getVaultPerformance(id: string): Promise<any> {
    const vault = await this.findOne(id);
    
    // TODO: Implement historical performance data retrieval
    // This would typically fetch from VaultPerformance table or external API
    return {
      vaultId: id,
      currentAPY: vault.apy,
      historicalAPY: [], // Will be implemented with VaultPerformance model
      tvlHistory: [], // Will be implemented with VaultPerformance model
      lastUpdated: new Date(),
    };
  }

  private transformVaultToDto(vault: Vault): VaultDto {
    return {
      id: vault.id,
      name: vault.name,
      address: vault.address,
      protocol: vault.protocol,
      tokenAddress: vault.tokenAddress,
      tokenSymbol: vault.tokenSymbol,
      apy: vault.apy,
      riskLevel: vault.riskLevel,
      category: vault.category,
      tvl: vault.tvl.toString(),
      active: vault.active,
      insuranceAvailable: vault.insuranceAvailable,
      autoCompounding: vault.autoCompounding,
      withdrawalTerms: vault.withdrawalTerms,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
    };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  PortfolioOverviewDto,
  PortfolioPositionDto,
  TransactionDto,
  TransactionQueryDto,
  TransactionListResponseDto,
  PortfolioExportQueryDto,
  PortfolioExportResponseDto,
} from './dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get portfolio overview for a user
   * @param address User wallet address
   * @returns Portfolio overview with aggregated data
   */
  async getPortfolioOverview(address: string): Promise<PortfolioOverviewDto> {
    this.logger.log(`Getting portfolio overview for address: ${address}`);

    // Find user by address
    const user = await this.prisma.user.findUnique({
      where: { address },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${address} not found`);
    }

    // Get all portfolio positions
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        vault: {
          include: {
            vaultPerformance: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
        transactions: {
          where: { status: 'confirmed' },
          orderBy: { executedAt: 'desc' },
        },
      },
    });

    // Get active rules count
    const activeRules = await this.prisma.rule.count({
      where: {
        userId: user.id,
        active: true,
      },
    });

    // Calculate aggregated metrics
    const totalValue = portfolios.reduce((sum, p) => sum.add(p.currentValue), new Decimal(0));
    const totalDeposited = portfolios.reduce((sum, p) => sum.add(p.depositAmount), new Decimal(0));
    const totalUnrealizedPnl = portfolios.reduce((sum, p) => sum.add(p.unrealizedPnl), new Decimal(0));
    const totalRealizedPnl = portfolios.reduce((sum, p) => sum.add(p.realizedPnl), new Decimal(0));
    const totalDistributed = portfolios.reduce((sum, p) => sum.add(p.totalDistributed), new Decimal(0));

    // Calculate average APY (weighted by position value)
    const avgAPY = portfolios.length > 0 
      ? portfolios.reduce((sum, p) => sum + (p.avgAPY || 0) * parseFloat(p.currentValue.toString()), 0) / parseFloat(totalValue.toString())
      : 0;

    // Calculate performance over time periods
    const performance = await this.calculatePerformanceMetrics(user.id, portfolios);

    return {
      totalValue: totalValue.toFixed(2),
      totalDeposited: totalDeposited.toFixed(2),
      totalUnrealizedPnl: totalUnrealizedPnl.toFixed(2),
      totalRealizedPnl: totalRealizedPnl.toFixed(2),
      totalDistributed: totalDistributed.toFixed(2),
      avgAPY: Number(avgAPY.toFixed(2)),
      performance,
      activePositions: portfolios.filter(p => p.currentValue.gt(0)).length,
      activeRules,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all portfolio positions for a user
   * @param address User wallet address
   * @returns Array of portfolio positions
   */
  async getPortfolioPositions(address: string): Promise<PortfolioPositionDto[]> {
    this.logger.log(`Getting portfolio positions for address: ${address}`);

    // Find user by address
    const user = await this.prisma.user.findUnique({
      where: { address },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${address} not found`);
    }

    // Get all portfolio positions
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        vault: {
          include: {
            vaultPerformance: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Get active rules count for each position
    const positions = await Promise.all(
      portfolios.map(async (portfolio) => {
        const activeRules = await this.prisma.rule.count({
          where: {
            userId: user.id,
            vaultId: portfolio.vaultId,
            active: true,
          },
        });

        const performancePercentage = portfolio.depositAmount.gt(0) 
          ? portfolio.unrealizedPnl.div(portfolio.depositAmount).mul(100).toNumber()
          : 0;

        return {
          id: portfolio.id,
          vault: {
            id: portfolio.vault.id,
            name: portfolio.vault.name,
            protocol: portfolio.vault.protocol,
            tokenSymbol: portfolio.vault.tokenSymbol,
            riskLevel: portfolio.vault.riskLevel,
            category: portfolio.vault.category,
            currentAPY: portfolio.vault.vaultPerformance[0]?.apy || portfolio.vault.apy,
          },
          depositAmount: portfolio.depositAmount.toFixed(2),
          currentValue: portfolio.currentValue.toFixed(2),
          unrealizedPnl: portfolio.unrealizedPnl.toFixed(2),
          realizedPnl: portfolio.realizedPnl.toFixed(2),
          totalDistributed: portfolio.totalDistributed.toFixed(2),
          avgAPY: portfolio.avgAPY || 0,
          firstDepositAt: portfolio.firstDepositAt.toISOString(),
          lastUpdated: portfolio.lastUpdated.toISOString(),
          activeRules,
          performancePercentage: Number(performancePercentage.toFixed(2)),
        };
      })
    );

    return positions;
  }

  /**
   * Get transaction history for a user
   * @param query Query parameters for filtering transactions
   * @returns Paginated transaction list
   */
  async getTransactionHistory(query: TransactionQueryDto): Promise<TransactionListResponseDto> {
    this.logger.log(`Getting transaction history for address: ${query.address}`);

    // Set default values
    const page = query.page || 1;
    const limit = query.limit || 20;

    // Find user by address
    const user = await this.prisma.user.findUnique({
      where: { address: query.address },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${query.address} not found`);
    }

    // Build where clause for filtering
    const whereClause: any = {
      portfolio: {
        userId: user.id,
      },
    };

    if (query.type) {
      whereClause.type = query.type;
    }

    if (query.vaultId) {
      whereClause.portfolio = {
        ...whereClause.portfolio,
        vaultId: query.vaultId,
      };
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.startDate || query.endDate) {
      whereClause.executedAt = {};
      if (query.startDate) {
        whereClause.executedAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereClause.executedAt.lte = new Date(query.endDate);
      }
    }

    // Get total count
    const total = await this.prisma.transaction.count({
      where: whereClause,
    });

    // Get transactions with pagination
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        portfolio: {
          include: {
            vault: true,
          },
        },
      },
      orderBy: { executedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform transactions to DTOs
    const transactionDtos: TransactionDto[] = transactions.map((tx) => ({
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      amount: tx.amount.toFixed(2),
      tokenSymbol: tx.tokenSymbol,
      status: tx.status,
      blockNumber: tx.blockNumber || 0,
      gasUsed: tx.gasUsed?.toFixed(8) || '0',
      gasFee: tx.gasFee?.toFixed(8) || '0',
      fromAddress: tx.fromAddress || '',
      toAddress: tx.toAddress || '',
      vault: {
        id: tx.portfolio.vault.id,
        name: tx.portfolio.vault.name,
        protocol: tx.portfolio.vault.protocol,
        tokenSymbol: tx.portfolio.vault.tokenSymbol,
      },
      executedAt: tx.executedAt.toISOString(),
      confirmedAt: tx.confirmedAt?.toISOString() || '',
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactionDtos,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Export portfolio data for tax purposes
   * @param query Export parameters
   * @returns Export response with download URL or data
   */
  async exportPortfolioData(query: PortfolioExportQueryDto): Promise<PortfolioExportResponseDto> {
    this.logger.log(`Exporting portfolio data for address: ${query.address}, format: ${query.format}`);

    // Find user by address
    const user = await this.prisma.user.findUnique({
      where: { address: query.address },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${query.address} not found`);
    }

    // Determine date range
    const dateRange = this.getExportDateRange(query);

    // Get transactions for export
    const transactions = await this.prisma.transaction.findMany({
      where: {
        portfolio: {
          userId: user.id,
        },
        status: 'confirmed',
        executedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
        ...(query.taxableOnly ? { type: { in: ['distribution', 'withdrawal'] } } : {}),
      },
      include: {
        portfolio: {
          include: {
            vault: true,
          },
        },
      },
      orderBy: { executedAt: 'asc' },
    });

    // Get portfolio summary
    const portfolioSummary = await this.getPortfolioOverview(query.address);

    // Prepare export data
    const exportData = {
      summary: {
        exportDate: new Date().toISOString(),
        userAddress: query.address,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        totalTransactions: transactions.length,
        portfolioSummary,
      },
      transactions: transactions.map((tx) => ({
        date: tx.executedAt.toISOString(),
        type: tx.type,
        amount: tx.amount.toFixed(2),
        tokenSymbol: tx.tokenSymbol,
        vault: tx.portfolio.vault.name,
        protocol: tx.portfolio.vault.protocol,
        transactionHash: tx.hash,
        gasUsed: tx.gasUsed?.toFixed(8) || '0',
        gasFee: tx.gasFee?.toFixed(8) || '0',
        status: tx.status,
      })),
      taxSummary: this.calculateTaxSummary(transactions),
    };

    // Handle different export formats
    switch (query.format) {
      case 'json':
        return {
          data: exportData,
          metadata: {
            format: 'json',
            generatedAt: new Date().toISOString(),
            totalRecords: transactions.length,
            dateRange: {
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString(),
            },
          },
        };

      case 'csv':
      case 'pdf':
        // For CSV and PDF, we would generate files and return download URLs
        // For now, return a placeholder URL
        const filename = `portfolio-${query.format}-${Date.now()}.${query.format}`;
        return {
          downloadUrl: `/api/exports/${filename}`,
          metadata: {
            format: query.format,
            generatedAt: new Date().toISOString(),
            totalRecords: transactions.length,
            dateRange: {
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString(),
            },
          },
        };

      default:
        throw new Error(`Unsupported export format: ${query.format}`);
    }
  }

  /**
   * Calculate performance metrics over different time periods
   * @param portfolios Portfolio data
   * @returns Performance metrics
   */
  private async calculatePerformanceMetrics(_userId: string, portfolios: any[]): Promise<{
    '24h': number;
    '7d': number;
    '30d': number;
    '1y': number;
  }> {
    // This is a simplified calculation - in production, you'd track historical values
    const currentTotal = portfolios.reduce((sum, p) => sum + parseFloat(p.currentValue.toString()), 0);
    const depositedTotal = portfolios.reduce((sum, p) => sum + parseFloat(p.depositAmount.toString()), 0);
    
    const totalReturn = ((currentTotal - depositedTotal) / depositedTotal) * 100;
    
    // Mock time-based performance (in production, calculate from historical data)
    return {
      '24h': Number((totalReturn * 0.01).toFixed(2)), // 1% of total return for 24h
      '7d': Number((totalReturn * 0.05).toFixed(2)), // 5% of total return for 7d
      '30d': Number((totalReturn * 0.20).toFixed(2)), // 20% of total return for 30d
      '1y': Number(totalReturn.toFixed(2)), // Full return for 1y
    };
  }

  /**
   * Get date range for export based on query parameters
   * @param query Export query parameters
   * @returns Date range object
   */
  private getExportDateRange(query: PortfolioExportQueryDto): { start: Date; end: Date } {
    if (query.startDate && query.endDate) {
      return {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }

    if (query.year) {
      return {
        start: new Date(`${query.year}-01-01T00:00:00Z`),
        end: new Date(`${query.year}-12-31T23:59:59Z`),
      };
    }

    // Default to current year
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(`${currentYear}-01-01T00:00:00Z`),
      end: new Date(`${currentYear}-12-31T23:59:59Z`),
    };
  }

  /**
   * Calculate tax summary from transactions
   * @param transactions Transaction data
   * @returns Tax summary
   */
  private calculateTaxSummary(transactions: any[]): any {
    const taxableTransactions = transactions.filter(tx => 
      tx.type === 'distribution' || tx.type === 'withdrawal'
    );

    const totalTaxableAmount = taxableTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.amount.toString()), 0
    );

    const totalGasFees = transactions.reduce((sum, tx) => 
      sum + parseFloat(tx.gasFee?.toString() || '0'), 0
    );

    return {
      totalTaxableEvents: taxableTransactions.length,
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalGasFees: totalGasFees.toFixed(8),
      distributionEvents: taxableTransactions.filter(tx => tx.type === 'distribution').length,
      withdrawalEvents: taxableTransactions.filter(tx => tx.type === 'withdrawal').length,
    };
  }
}
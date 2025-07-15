import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  PlatformAnalyticsDto,
  TvlMetricsDto,
  TvlMetricsQueryDto,
  UserAnalyticsDto,
} from './dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get platform-wide analytics
   * @returns Platform analytics data
   */
  async getPlatformAnalytics(): Promise<PlatformAnalyticsDto> {
    this.logger.log('Getting platform analytics');

    // Get TVL data
    const vaults = await this.prisma.vault.findMany({
      where: { active: true },
      select: { tvl: true, protocol: true },
    });

    const totalTvl = vaults.reduce((sum, vault) => sum.add(vault.tvl), new Decimal(0));
    const mockTvlChange = totalTvl.mul(0.0526); // Mock 5.26% change

    // Get user statistics
    const totalUsers = await this.prisma.user.count();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers24h = await this.prisma.user.count({
      where: {
        updatedAt: { gte: oneDayAgo },
      },
    });

    // Get transaction statistics
    const totalTransactions = await this.prisma.transaction.count();
    const transactions24h = await this.prisma.transaction.findMany({
      where: {
        executedAt: { gte: oneDayAgo },
        status: 'confirmed',
      },
      select: { amount: true, gasFee: true },
    });

    const volume24h = transactions24h.reduce(
      (sum, tx) => sum.add(tx.amount),
      new Decimal(0)
    );
    const fees24h = transactions24h.reduce(
      (sum, tx) => sum.add(tx.gasFee || 0),
      new Decimal(0)
    );

    // Get rules statistics
    const totalRules = await this.prisma.rule.count();
    const activeRules = await this.prisma.rule.count({
      where: { active: true },
    });

    const executionsToday = await this.prisma.ruleExecution.count({
      where: {
        executedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    // Get yield statistics
    const executions = await this.prisma.ruleExecution.findMany({
      where: { status: 'completed' },
      select: { profitAmount: true, performanceFee: true },
    });

    const totalDistributed = executions.reduce(
      (sum, exec) => sum.add(exec.profitAmount),
      new Decimal(0)
    );
    const totalFeesGenerated = executions.reduce(
      (sum, exec) => sum.add(exec.performanceFee || 0),
      new Decimal(0)
    );

    // Calculate average APY (mock calculation)
    const avgAPY = vaults.length > 0 
      ? vaults.reduce((sum, _vault, _index, _arr) => sum + (5.5 + Math.random() * 5), 0) / vaults.length
      : 0;

    // Calculate protocol distribution
    const protocolMap = new Map<string, Decimal>();
    vaults.forEach(vault => {
      const existing = protocolMap.get(vault.protocol) || new Decimal(0);
      protocolMap.set(vault.protocol, existing.add(vault.tvl));
    });

    const protocols: { [key: string]: { tvl: string; percentage: number } } = {};
    protocolMap.forEach((tvl, protocol) => {
      protocols[protocol] = {
        tvl: tvl.toFixed(2),
        percentage: parseFloat(tvl.div(totalTvl).mul(100).toFixed(2)),
      };
    });

    return {
      tvl: {
        current: totalTvl.toFixed(2),
        change24h: parseFloat(mockTvlChange.toFixed(2)),
        changePercentage: 5.26,
      },
      users: {
        total: totalUsers,
        active24h: activeUsers24h,
        growth: 12.5, // Mock growth percentage
      },
      transactions: {
        total: totalTransactions,
        volume24h: volume24h.toFixed(2),
        fees24h: fees24h.toFixed(8),
      },
      yields: {
        averageAPY: parseFloat(avgAPY.toFixed(2)),
        totalDistributed: totalDistributed.toFixed(2),
        totalFeesGenerated: totalFeesGenerated.toFixed(2),
      },
      rules: {
        totalRules,
        activeRules,
        executionsToday,
      },
      protocols,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get TVL metrics for a specific timeframe
   * @param query Query parameters
   * @returns TVL metrics data
   */
  async getTvlMetrics(query: TvlMetricsQueryDto): Promise<TvlMetricsDto> {
    this.logger.log(`Getting TVL metrics for timeframe: ${query.timeframe}`);

    // Get current TVL
    const vaults = await this.prisma.vault.findMany({
      where: { active: true },
      select: { tvl: true },
    });

    const currentTvl = vaults.reduce((sum, vault) => sum.add(vault.tvl), new Decimal(0));

    // Calculate timeframe
    const timeframeHours = this.getTimeframeHours(query.timeframe || '24h');

    // Generate mock historical data (in production, this would come from vault_performance table)
    const dataPoints = this.generateMockTvlHistory(currentTvl, timeframeHours);

    const startValue = dataPoints[0]?.tvl || currentTvl.toFixed(2);
    const totalChange = currentTvl.sub(startValue);
    const percentageChange = parseFloat(totalChange.div(startValue).mul(100).toFixed(2));

    // Find peak and low
    const tvlValues = dataPoints.map(dp => parseFloat(dp.tvl));
    const peak = Math.max(...tvlValues);
    const low = Math.min(...tvlValues);

    return {
      current: currentTvl.toFixed(2),
      startValue,
      totalChange: parseFloat(totalChange.toFixed(2)),
      percentageChange,
      peak: peak.toFixed(2),
      low: low.toFixed(2),
      history: dataPoints,
      timeframe: query.timeframe || '24h',
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get user-specific analytics
   * @param userAddress User wallet address
   * @returns User analytics data
   */
  async getUserAnalytics(userAddress: string): Promise<UserAnalyticsDto> {
    this.logger.log(`Getting user analytics for address: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
      include: {
        portfolios: {
          include: {
            vault: true,
            transactions: true,
          },
        },
        rules: {
          include: {
            executions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Calculate portfolio metrics
    const totalValue = user.portfolios.reduce(
      (sum, p) => sum.add(p.currentValue),
      new Decimal(0)
    );
    const totalDeposited = user.portfolios.reduce(
      (sum, p) => sum.add(p.depositAmount),
      new Decimal(0)
    );
    const totalPnl = user.portfolios.reduce(
      (sum, p) => sum.add(p.unrealizedPnl).add(p.realizedPnl),
      new Decimal(0)
    );

    // Calculate rules metrics
    const totalExecutions = user.rules.reduce(
      (sum, rule) => sum + rule.executions.length,
      0
    );
    const totalDistributed = user.rules.reduce(
      (sum, rule) => rule.executions.reduce(
        (ruleSum, exec) => ruleSum.add(exec.profitAmount),
        sum
      ),
      new Decimal(0)
    );

    // Calculate transaction metrics
    const allTransactions = user.portfolios.flatMap(p => p.transactions);
    const totalVolume = allTransactions.reduce(
      (sum, tx) => sum.add(tx.amount),
      new Decimal(0)
    );
    const totalFees = allTransactions.reduce(
      (sum, tx) => sum.add(tx.gasFee || 0),
      new Decimal(0)
    );

    // Find best performing vault
    const bestVault = user.portfolios
      .sort((a, b) => b.unrealizedPnl.sub(a.unrealizedPnl).toNumber())[0];

    // Calculate activity metrics
    const lastActivity = allTransactions.length > 0 
      ? allTransactions.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())[0]?.executedAt || user.updatedAt
      : user.updatedAt;

    const daysSinceJoin = Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));
    const avgTransactionsPerDay = daysSinceJoin > 0 ? allTransactions.length / daysSinceJoin : 0;

    // Mock rankings (in production, these would be calculated from all users)
    const tvlRank = Math.floor(Math.random() * 100) + 1;
    const returnsRank = Math.floor(Math.random() * 100) + 1;
    const automationRank = Math.floor(Math.random() * 100) + 1;

    // Mock badges
    const badges = [];
    if (user.createdAt < new Date('2024-02-01')) badges.push('Early Adopter');
    if (user.rules.length >= 3) badges.push('Automation Expert');
    if (totalPnl.gt(1000)) badges.push('Profit Master');
    if (totalExecutions >= 10) badges.push('Veteran Trader');

    return {
      userAddress,
      joinedAt: user.createdAt.toISOString(),
      portfolio: {
        totalValue: totalValue.toFixed(2),
        totalDeposited: totalDeposited.toFixed(2),
        totalPnl: totalPnl.toFixed(2),
        activePositions: user.portfolios.filter(p => p.currentValue.gt(0)).length,
      },
      rules: {
        totalRules: user.rules.length,
        activeRules: user.rules.filter(r => r.active).length,
        totalExecutions,
        totalDistributed: totalDistributed.toFixed(2),
      },
      transactions: {
        totalTransactions: allTransactions.length,
        totalVolume: totalVolume.toFixed(2),
        totalFees: totalFees.toFixed(8),
      },
      performance: {
        averageAPY: user.portfolios.length > 0 
          ? user.portfolios.reduce((sum, p) => sum + (p.avgAPY || 0), 0) / user.portfolios.length
          : 0,
        bestPerformingVault: bestVault ? {
          name: bestVault.vault.name,
          apy: bestVault.avgAPY || 0,
          returns: bestVault.unrealizedPnl.toFixed(2),
        } : {
          name: 'No positions',
          apy: 0,
          returns: '0.00',
        },
        totalReturns: totalPnl.toFixed(2),
      },
      activity: {
        lastActivity: lastActivity.toISOString(),
        daysActive: daysSinceJoin,
        avgTransactionsPerDay: parseFloat(avgTransactionsPerDay.toFixed(2)),
      },
      rankings: {
        tvlRank,
        returnsRank,
        automationRank,
        badges,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get hours from timeframe string
   * @param timeframe Timeframe string
   * @returns Hours
   */
  private getTimeframeHours(timeframe: string): number {
    switch (timeframe) {
      case '24h':
        return 24;
      case '7d':
        return 7 * 24;
      case '30d':
        return 30 * 24;
      case '1y':
        return 365 * 24;
      default:
        return 24;
    }
  }

  /**
   * Generate mock TVL history data
   * @param currentTvl Current TVL
   * @param timeframeHours Timeframe in hours
   * @returns Mock historical data
   */
  private generateMockTvlHistory(
    currentTvl: Decimal,
    timeframeHours: number
  ): Array<{ timestamp: string; tvl: string; change: number }> {
    const dataPoints = [];
    const intervalsCount = Math.min(timeframeHours, 100); // Max 100 data points
    const intervalHours = timeframeHours / intervalsCount;

    let previousTvl = currentTvl.mul(0.95); // Start 5% lower

    for (let i = 0; i < intervalsCount; i++) {
      const timestamp = new Date(Date.now() - (intervalsCount - i) * intervalHours * 60 * 60 * 1000);
      
      // Add some randomness to simulate real data
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random change
      const newTvl = previousTvl.mul(1 + randomChange);
      
      const change = newTvl.sub(previousTvl).div(previousTvl).mul(100).toNumber();
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        tvl: newTvl.toFixed(2),
        change: parseFloat(change.toFixed(2)),
      });
      
      previousTvl = newTvl;
    }

    // Ensure the last data point matches current TVL
    if (dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      if (lastPoint) {
        lastPoint.tvl = currentTvl.toFixed(2);
      }
    }

    return dataPoints;
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Valux.finance Backend API - DeFi Automation Platform';
  }

  async getHealthCheck() {
    const dbHealthy = await this.prisma.isHealthy();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
      },
      version: '1.0.0',
    };
  }

  async getDatabaseStats() {
    try {
      const [userCount, vaultCount, ruleCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.vault.count(),
        this.prisma.rule.count(),
      ]);

      return {
        users: userCount,
        vaults: vaultCount,
        rules: ruleCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  }
}

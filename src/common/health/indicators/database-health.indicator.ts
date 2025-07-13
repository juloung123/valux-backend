import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test database connection with a simple query
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Get additional database info
      const result = await this.prisma.$queryRaw<Array<{ version: string }>>`
        SELECT version() as version
      `;
      
      return this.getStatus(key, true, {
        status: 'up',
        version: result[0]?.version || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
      
      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, {
          status: 'down',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
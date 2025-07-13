import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // For now, we'll implement a basic check
      // In a real implementation, you would inject a Redis client
      const redisUrl = this.configService.get('REDIS_URL');
      
      if (!redisUrl) {
        throw new Error('Redis URL not configured');
      }

      // TODO: Implement actual Redis ping when Redis client is added
      // For now, just check if the URL is configured
      return this.getStatus(key, true, {
        status: 'up',
        url: redisUrl.replace(/\/\/[^@]*@/, '//***:***@'), // Hide credentials
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redis connection failed';
      
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, {
          status: 'down',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
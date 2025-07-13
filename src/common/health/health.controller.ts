import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseHealthIndicator } from './indicators/database-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { BlockchainHealthIndicator } from './indicators/blockchain-health.indicator';
import { ApiSuccessResponse, ApiErrorResponse } from '@/common/decorators/api-response.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
    private blockchain: BlockchainHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check for all services',
    description: 'Returns the health status of database, Redis, and blockchain connections'
  })
  @ApiSuccessResponse(Object, 'Health check successful')
  @ApiErrorResponse(503, 'Service unavailable')
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.blockchain.isHealthy('blockchain'),
    ]);
  }

  @Get('database')
  @ApiOperation({ 
    summary: 'Database health check',
    description: 'Returns the health status of the database connection'
  })
  @HealthCheck()
  checkDatabase(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.isHealthy('database'),
    ]);
  }

  @Get('redis')
  @ApiOperation({ 
    summary: 'Redis health check',
    description: 'Returns the health status of the Redis connection'
  })
  @HealthCheck()
  checkRedis(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.redis.isHealthy('redis'),
    ]);
  }

  @Get('blockchain')
  @ApiOperation({ 
    summary: 'Blockchain health check',
    description: 'Returns the health status of the blockchain RPC connection'
  })
  @HealthCheck()
  checkBlockchain(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.blockchain.isHealthy('blockchain'),
    ]);
  }
}
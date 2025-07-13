import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider } from 'ethers';

@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  private provider?: JsonRpcProvider;

  constructor(private readonly configService: ConfigService) {
    super();
    const rpcUrl = this.configService.get('ARBITRUM_RPC_URL');
    if (rpcUrl) {
      this.provider = new JsonRpcProvider(rpcUrl);
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain RPC URL not configured');
      }

      // Test blockchain connection
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return this.getStatus(key, true, {
        status: 'up',
        network: {
          name: network.name,
          chainId: Number(network.chainId),
        },
        blockNumber,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Blockchain connection failed';
      
      throw new HealthCheckError(
        'Blockchain health check failed',
        this.getStatus(key, false, {
          status: 'down',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
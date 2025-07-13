import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    
    @InjectMetric('database_queries_total')
    private readonly databaseQueriesTotal: Counter<string>,
    
    @InjectMetric('database_query_duration_seconds')
    private readonly databaseQueryDuration: Histogram<string>,
    
    @InjectMetric('blockchain_transactions_total')
    private readonly blockchainTransactionsTotal: Counter<string>,
    
    @InjectMetric('active_users')
    private readonly activeUsers: Gauge<string>,
    
    @InjectMetric('vault_tvl_total')
    private readonly vaultTvlTotal: Gauge<string>,
  ) {}

  // HTTP Metrics
  incrementHttpRequests(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  recordHttpRequestDuration(method: string, route: string, duration: number): void {
    this.httpRequestDuration
      .labels(method, route)
      .observe(duration);
  }

  // Database Metrics
  incrementDatabaseQueries(operation: string, table: string): void {
    this.databaseQueriesTotal
      .labels(operation, table)
      .inc();
  }

  recordDatabaseQueryDuration(operation: string, table: string, duration: number): void {
    this.databaseQueryDuration
      .labels(operation, table)
      .observe(duration);
  }

  // Blockchain Metrics
  incrementBlockchainTransactions(type: string, status: string): void {
    this.blockchainTransactionsTotal
      .labels(type, status)
      .inc();
  }

  // Business Metrics
  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  setVaultTvl(vaultId: string, protocol: string, tvl: number): void {
    this.vaultTvlTotal
      .labels(vaultId, protocol)
      .set(tvl);
  }

  // Custom metrics for business events
  recordUserAction(action: string): void {
    // Implementation for tracking user actions
    this.httpRequestsTotal
      .labels('user_action', action, '200')
      .inc();
  }

  recordVaultInteraction(vaultId: string, action: string): void {
    // Implementation for tracking vault interactions
    this.httpRequestsTotal
      .labels('vault_interaction', action, vaultId)
      .inc();
  }
}
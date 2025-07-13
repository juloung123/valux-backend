import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(INQUIRER) parentClass: object,
  ) {
    if (parentClass) {
      this.context = parentClass.constructor.name;
    }
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Custom methods for structured logging
  logApiRequest(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    this.logger.info('API Request', {
      context: this.context,
      method,
      url,
      statusCode,
      responseTime,
      userAgent,
      type: 'api_request',
    });
  }

  logDatabaseQuery(query: string, duration: number, recordCount?: number): void {
    this.logger.debug('Database Query', {
      context: this.context,
      query,
      duration,
      recordCount,
      type: 'database_query',
    });
  }

  logBlockchainTransaction(
    txHash: string,
    method: string,
    status: 'pending' | 'confirmed' | 'failed',
    gasUsed?: number,
  ): void {
    this.logger.info('Blockchain Transaction', {
      context: this.context,
      txHash,
      method,
      status,
      gasUsed,
      type: 'blockchain_transaction',
    });
  }

  logUserAction(
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, any>,
  ): void {
    this.logger.info('User Action', {
      context: this.context,
      userId,
      action,
      resource,
      details,
      type: 'user_action',
    });
  }

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, any>,
  ): void {
    this.logger.warn('Security Event', {
      context: this.context,
      event,
      severity,
      details,
      type: 'security_event',
    });
  }

  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
  ): void {
    this.logger.info('Performance Metric', {
      context: this.context,
      metric,
      value,
      unit,
      tags,
      type: 'performance_metric',
    });
  }

  logBusinessEvent(
    event: string,
    data: Record<string, any>,
  ): void {
    this.logger.info('Business Event', {
      context: this.context,
      event,
      data,
      type: 'business_event',
    });
  }
}
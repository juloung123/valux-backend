import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    
    // Log incoming request
    this.logger.log(
      `➤ ${method} ${url} - ${ip} - ${userAgent}`,
      'Request',
    );

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        this.logger.log(
          `✓ ${method} ${url} - ${response.statusCode} - ${delay}ms`,
          'Response',
        );
      }),
      catchError((error) => {
        const delay = Date.now() - now;
        this.logger.error(
          `✗ ${method} ${url} - ${error.status || 500} - ${delay}ms - ${error.message}`,
          error.stack,
          'Error',
        );
        throw error;
      }),
    );
  }
}
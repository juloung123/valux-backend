import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode?: string;
  path: string;
  timestamp: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    // Log the error for monitoring
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        return {
          statusCode: status,
          ...exceptionResponse,
          path,
          timestamp,
        } as ErrorResponse;
      }

      return {
        statusCode: status,
        message: exception.message || 'An error occurred',
        path,
        timestamp,
      };
    }

    // Handle Prisma database errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, path, timestamp);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided',
        errorCode: 'VALIDATION_ERROR',
        path,
        timestamp,
        details: 'Database validation failed',
      };
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection error',
        errorCode: 'DATABASE_ERROR',
        path,
        timestamp,
      };
    }

    // Handle unexpected errors
    const error = exception as Error;
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      path,
      timestamp,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string,
    timestamp: string,
  ): ErrorResponse {
    const { code, meta } = exception;

    switch (code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with this information already exists',
          errorCode: 'DUPLICATE_RECORD',
          path,
          timestamp,
          details: meta?.target ? `Duplicate value for: ${(meta.target as string[]).join(', ')}` : undefined,
        };

      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          errorCode: 'RECORD_NOT_FOUND',
          path,
          timestamp,
        };

      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid foreign key reference',
          errorCode: 'FOREIGN_KEY_CONSTRAINT',
          path,
          timestamp,
        };

      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The change you are trying to make would violate the required relation',
          errorCode: 'RELATION_VIOLATION',
          path,
          timestamp,
        };

      case 'P2021':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'The table does not exist in the current database',
          errorCode: 'TABLE_NOT_EXISTS',
          path,
          timestamp,
        };

      case 'P2024':
        return {
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Database operation timed out',
          errorCode: 'DATABASE_TIMEOUT',
          path,
          timestamp,
        };

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          errorCode: 'DATABASE_ERROR',
          path,
          timestamp,
          details: process.env.NODE_ENV === 'development' ? exception.message : undefined,
        };
    }
  }

  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    
    const logContext = {
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      timestamp: errorResponse.timestamp,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${method} ${url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : String(exception),
        JSON.stringify(logContext),
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${method} ${url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
        JSON.stringify(logContext),
      );
    }
  }
}
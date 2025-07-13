import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for business logic errors
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    errorCode?: string,
  ) {
    const error = {
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    };
    
    super(error, statusCode);
  }
}

/**
 * Custom exception for validation errors
 */
export class ValidationException extends HttpException {
  constructor(
    message: string,
    validationErrors: Record<string, string[]> = {},
  ) {
    const error = {
      message,
      validationErrors,
      timestamp: new Date().toISOString(),
    };
    
    super(error, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Custom exception for authentication/authorization errors
 */
export class AuthException extends HttpException {
  constructor(
    message: string = 'Authentication required',
    statusCode: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    const error = {
      message,
      timestamp: new Date().toISOString(),
    };
    
    super(error, statusCode);
  }
}

/**
 * Custom exception for resource not found errors
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    const error = {
      message,
      resource,
      identifier,
      timestamp: new Date().toISOString(),
    };
    
    super(error, HttpStatus.NOT_FOUND);
  }
}

/**
 * Custom exception for Web3/blockchain related errors
 */
export class BlockchainException extends HttpException {
  constructor(
    message: string,
    operation?: string,
    transactionHash?: string,
  ) {
    const error = {
      message,
      operation,
      transactionHash,
      timestamp: new Date().toISOString(),
    };
    
    super(error, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Custom exception for rate limiting
 */
export class RateLimitException extends HttpException {
  constructor(limit: number, windowMs: number) {
    const error = {
      message: `Rate limit exceeded. Maximum ${limit} requests per ${windowMs / 1000} seconds`,
      limit,
      windowMs,
      timestamp: new Date().toISOString(),
    };
    
    super(error, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * Custom exception for configuration errors
 */
export class ConfigurationException extends HttpException {
  constructor(configKey: string, message?: string) {
    const error = {
      message: message || `Configuration error for key: ${configKey}`,
      configKey,
      timestamp: new Date().toISOString(),
    };
    
    super(error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
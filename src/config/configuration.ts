import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  logQueries: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface BlockchainConfig {
  arbitrumRpcUrl: string;
  privateKey: string;
  chainId: number;
  gasLimit: number;
  maxGasPrice: string;
}

export interface RedisConfig {
  url: string;
  ttl: number;
}

export interface AppConfig {
  port: number;
  environment: string;
  corsOrigin: string;
  apiPrefix: string;
  enableSwagger: boolean;
  logLevel: string;
}

export interface SecurityConfig {
  rateLimitTtl: number;
  rateLimitLimit: number;
  enableHelmet: boolean;
  sessionSecret: string;
}

export const validationSchema = Joi.object({
  // App configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8080),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  API_PREFIX: Joi.string().default('api'),
  ENABLE_SWAGGER: Joi.boolean().default(true),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  // Database configuration
  DATABASE_URL: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().default(false),
  DATABASE_LOG_QUERIES: Joi.boolean().default(false),

  // JWT configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Blockchain configuration
  ARBITRUM_RPC_URL: Joi.string().uri().required(),
  PRIVATE_KEY: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(),
  CHAIN_ID: Joi.number().default(42161), // Arbitrum One
  GAS_LIMIT: Joi.number().default(500000),
  MAX_GAS_PRICE: Joi.string().default('100'), // in gwei

  // Redis configuration
  REDIS_URL: Joi.string().uri().required(),
  REDIS_TTL: Joi.number().default(3600), // 1 hour

  // Security configuration
  RATE_LIMIT_TTL: Joi.number().default(60), // 1 minute
  RATE_LIMIT_LIMIT: Joi.number().default(100), // 100 requests per minute
  ENABLE_HELMET: Joi.boolean().default(true),
  SESSION_SECRET: Joi.string().min(32).required(),

  // Optional monitoring
  SENTRY_DSN: Joi.string().uri().optional(),
  DATADOG_API_KEY: Joi.string().optional(),
});

export const appConfig = registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '8080', 10),
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api',
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
}));

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_SSL === 'true',
  logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
}));

export const jwtConfig = registerAs('jwt', (): JwtConfig => ({
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));

export const blockchainConfig = registerAs('blockchain', (): BlockchainConfig => ({
  arbitrumRpcUrl: process.env.ARBITRUM_RPC_URL!,
  privateKey: process.env.PRIVATE_KEY!,
  chainId: parseInt(process.env.CHAIN_ID || '42161', 10),
  gasLimit: parseInt(process.env.GAS_LIMIT || '500000', 10),
  maxGasPrice: process.env.MAX_GAS_PRICE || '100',
}));

export const redisConfig = registerAs('redis', (): RedisConfig => ({
  url: process.env.REDIS_URL!,
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
}));

export const securityConfig = registerAs('security', (): SecurityConfig => ({
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  enableHelmet: process.env.ENABLE_HELMET === 'true',
  sessionSecret: process.env.SESSION_SECRET!,
}));
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { CustomLoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logLevel = configService.get('LOG_LEVEL', 'info');
        const nodeEnv = configService.get('NODE_ENV', 'development');
        
        const formats = [
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ];

        if (nodeEnv === 'development') {
          formats.push(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const contextStr = context ? `[${context}] ` : '';
              const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
              return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
            }),
          );
        }

        const transports = [
          new winston.transports.Console({
            level: logLevel,
            format: winston.format.combine(...formats),
          }),
        ];

        // Add file transport for production
        if (nodeEnv === 'production') {
          transports.push(
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
            }) as any,
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
              ),
            }) as any,
          );
        }

        return {
          level: logLevel,
          format: winston.format.combine(...formats),
          transports,
          defaultMeta: {
            service: 'valux-backend',
            environment: nodeEnv,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
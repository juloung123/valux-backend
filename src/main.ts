import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

// Lock file to prevent multiple instances
const LOCK_FILE = path.join(__dirname, '..', 'server.lock');

// Function to create lock file
const createLockFile = (port: number, pid: number): boolean => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = fs.readFileSync(LOCK_FILE, 'utf8');
      const { pid: existingPid } = JSON.parse(lockData);
      
      // Check if existing process is still running
      try {
        process.kill(existingPid, 0); // Check if process exists without killing it
        return false; // Process is still running
      } catch (err) {
        // Process is dead, remove stale lock file
        fs.unlinkSync(LOCK_FILE);
      }
    }
    
    // Create new lock file
    fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid, port, timestamp: Date.now() }));
    return true;
  } catch (error) {
    return false;
  }
};

// Function to remove lock file
const removeLockFile = (): void => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    // Ignore errors when removing lock file
  }
};

async function bootstrap() {
  const port = Number(process.env.PORT) || 8080;
  
  // Check for existing server instance using lock file BEFORE creating app
  if (!createLockFile(port, process.pid)) {
    console.error(`❌ Another server instance is already running on port ${port}!`);
    console.error(`   Lock file exists: ${LOCK_FILE}`);
    console.error(`   Try: npm run server:stop && npm run server:start`);
    console.error(`   Or force kill: pkill -f "nest start"`);
    process.exit(1);
  }
  
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'stats'], // Exclude health checks from api prefix
  });

  // Swagger API documentation
  const { swaggerConfig, swaggerCustomOptions } = await import('./common/swagger/swagger.config');
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);

  // Enable graceful shutdown
  app.enableShutdownHooks();
  
  // Handle graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.log(`🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      removeLockFile(); // Remove lock file on shutdown
      logger.log('✅ Application shut down gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      removeLockFile(); // Ensure lock file is removed even on error
      process.exit(1);
    }
  };

  // Listen for shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  try {
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔍 Health Check: http://localhost:${port}/health`);
  } catch (error) {
    const err = error as any;
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${port} is already in use. Please stop the existing server or use a different port.`);
      logger.error(`   Try: npm run server:stop && npm run server:start`);
    } else {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`❌ Failed to start server: ${errorMessage}`);
    }
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Clean up method for testing
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Clean database can only be called in test environment');
    }

    const models = Reflect.ownKeys(this).filter(key => key !== '_middlewares' && key !== '_engine');
    
    for (const modelKey of models) {
      const model = (this as any)[modelKey as string];
      if (model && typeof model.deleteMany === 'function') {
        await model.deleteMany();
      }
    }
  }
}
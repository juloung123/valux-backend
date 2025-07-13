import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { createMockPrismaService } from '@test/helpers/test-utils';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return health status with database connection', async () => {
      // Mock database health check
      jest.spyOn(appService, 'getHealth').mockResolvedValue({
        status: 'ok',
        services: {
          database: 'healthy',
        },
        timestamp: new Date().toISOString(),
      });

      const result = await appController.getHealth();
      
      expect(result.status).toBe('ok');
      expect(result.services.database).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      jest.spyOn(appService, 'getHealth').mockResolvedValue({
        status: 'error',
        services: {
          database: 'unhealthy',
        },
        timestamp: new Date().toISOString(),
      });

      const result = await appController.getHealth();
      
      expect(result.status).toBe('error');
      expect(result.services.database).toBe('unhealthy');
    });
  });

  describe('getStats', () => {
    it('should return database statistics', async () => {
      const mockStats = {
        tables: {
          users: 10,
          vaults: 5,
          rules: 8,
          portfolios: 12,
        },
        connections: 21,
        uptime: '2 hours',
      };

      jest.spyOn(appService, 'getStats').mockResolvedValue(mockStats);

      const result = await appController.getStats();
      
      expect(result.tables).toBeDefined();
      expect(result.connections).toBe(21);
      expect(result.uptime).toBe('2 hours');
    });
  });
});

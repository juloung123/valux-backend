import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;

  const mockVaults = [
    {
      tvl: new Decimal('25000000'),
      protocol: 'aave',
    },
    {
      tvl: new Decimal('15000000'),
      protocol: 'compound',
    },
    {
      tvl: new Decimal('10000000'),
      protocol: 'lido',
    },
  ];

  const mockUser = {
    id: 'user123',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    portfolios: [
      {
        currentValue: new Decimal('5000'),
        depositAmount: new Decimal('4000'),
        unrealizedPnl: new Decimal('800'),
        realizedPnl: new Decimal('200'),
        avgAPY: 8.5,
        vault: {
          name: 'Aave USDC Vault',
        },
        transactions: [
          {
            amount: new Decimal('1000'),
            gasFee: new Decimal('0.01'),
            executedAt: new Date(),
          },
        ],
      },
    ],
    rules: [
      {
        active: true,
        executions: [
          {
            profitAmount: new Decimal('100'),
            performanceFee: new Decimal('0.5'),
          },
        ],
      },
    ],
  };

  const mockPrismaService = {
    vault: {
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    rule: {
      count: jest.fn(),
    },
    ruleExecution: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlatformAnalytics', () => {
    it('should return platform analytics', async () => {
      // Arrange
      mockPrismaService.vault.findMany.mockResolvedValue(mockVaults);
      mockPrismaService.user.count.mockResolvedValueOnce(1250);
      mockPrismaService.user.count.mockResolvedValueOnce(89);
      mockPrismaService.transaction.count.mockResolvedValue(5678);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          amount: new Decimal('1000'),
          gasFee: new Decimal('0.01'),
        },
      ]);
      mockPrismaService.rule.count.mockResolvedValueOnce(456);
      mockPrismaService.rule.count.mockResolvedValueOnce(342);
      mockPrismaService.ruleExecution.count.mockResolvedValue(28);
      mockPrismaService.ruleExecution.findMany.mockResolvedValue([
        {
          profitAmount: new Decimal('500'),
          performanceFee: new Decimal('2.5'),
        },
      ]);

      // Act
      const result = await service.getPlatformAnalytics();

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          tvl: expect.objectContaining({
            current: '50000000.00',
            changePercentage: 5.26,
          }),
          users: expect.objectContaining({
            total: 1250,
            active24h: 89,
          }),
          transactions: expect.objectContaining({
            total: 5678,
            volume24h: '1000.00',
            fees24h: '0.01000000',
          }),
          yields: expect.objectContaining({
            totalDistributed: '500.00',
            totalFeesGenerated: '2.50',
          }),
          rules: expect.objectContaining({
            totalRules: 456,
            activeRules: 342,
            executionsToday: 28,
          }),
          protocols: expect.objectContaining({
            aave: expect.objectContaining({
              tvl: '25000000.00',
              percentage: 50,
            }),
            compound: expect.objectContaining({
              tvl: '15000000.00',
              percentage: 30,
            }),
            lido: expect.objectContaining({
              tvl: '10000000.00',
              percentage: 20,
            }),
          }),
        }),
      );
    });
  });

  describe('getTvlMetrics', () => {
    it('should return TVL metrics for 24h timeframe', async () => {
      // Arrange
      mockPrismaService.vault.findMany.mockResolvedValue(mockVaults);

      // Act
      const result = await service.getTvlMetrics({ timeframe: '24h' });

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          current: '50000000.00',
          timeframe: '24h',
          history: expect.arrayContaining([
            expect.objectContaining({
              timestamp: expect.any(String),
              tvl: expect.any(String),
              change: expect.any(Number),
            }),
          ]),
        }),
      );
    });

    it('should return TVL metrics for 7d timeframe', async () => {
      // Arrange
      mockPrismaService.vault.findMany.mockResolvedValue(mockVaults);

      // Act
      const result = await service.getTvlMetrics({ timeframe: '7d' });

      // Assert
      expect(result.timeframe).toBe('7d');
      expect(result.history.length).toBeGreaterThan(0);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics for valid user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserAnalytics(
        '0x1234567890abcdef1234567890abcdef12345678',
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          userAddress: '0x1234567890abcdef1234567890abcdef12345678',
          portfolio: expect.objectContaining({
            totalValue: '5000.00',
            totalDeposited: '4000.00',
            totalPnl: '1000.00',
            activePositions: 1,
          }),
          rules: expect.objectContaining({
            totalRules: 1,
            activeRules: 1,
            totalExecutions: 1,
            totalDistributed: '100.00',
          }),
          transactions: expect.objectContaining({
            totalTransactions: 1,
            totalVolume: '1000.00',
            totalFees: '0.01000000',
          }),
          performance: expect.objectContaining({
            averageAPY: 8.5,
            bestPerformingVault: expect.objectContaining({
              name: 'Aave USDC Vault',
              returns: '800.00',
            }),
            totalReturns: '1000.00',
          }),
        }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getUserAnalytics('0xnonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
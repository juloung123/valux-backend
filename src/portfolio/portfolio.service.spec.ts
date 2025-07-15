import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user123',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVault = {
    id: 'vault123',
    name: 'Aave USDC Vault',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    protocol: 'aave',
    tokenAddress: '0xa0b86a33e6428218005c62b3e09f44d23dba6333',
    tokenSymbol: 'USDC',
    apy: 5.25,
    riskLevel: 'low',
    category: 'stable',
    tvl: new Decimal('1000000'),
    active: true,
    insuranceAvailable: true,
    autoCompounding: true,
    withdrawalTerms: 'instant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPortfolio = {
    id: 'portfolio123',
    userId: 'user123',
    vaultId: 'vault123',
    depositAmount: new Decimal('5000'),
    currentValue: new Decimal('5200'),
    unrealizedPnl: new Decimal('200'),
    realizedPnl: new Decimal('150'),
    totalDistributed: new Decimal('100'),
    avgAPY: 5.8,
    firstDepositAt: new Date('2024-01-15'),
    lastUpdated: new Date(),
    vault: {
      ...mockVault,
      vaultPerformance: [{ apy: 5.25, tvl: new Decimal('1000000'), timestamp: new Date() }],
    },
    transactions: [],
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    portfolio: {
      findMany: jest.fn(),
    },
    rule: {
      count: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortfolioOverview', () => {
    it('should return portfolio overview for valid user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.portfolio.findMany.mockResolvedValue([mockPortfolio]);
      mockPrismaService.rule.count.mockResolvedValue(2);

      // Act
      const result = await service.getPortfolioOverview(mockUser.address);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          totalValue: '5200.00',
          totalDeposited: '5000.00',
          totalUnrealizedPnl: '200.00',
          totalRealizedPnl: '150.00',
          totalDistributed: '100.00',
          avgAPY: 5.8,
          activePositions: 1,
          activeRules: 2,
        }),
      );
      expect(result.performance).toEqual(
        expect.objectContaining({
          '24h': expect.any(Number),
          '7d': expect.any(Number),
          '30d': expect.any(Number),
          '1y': expect.any(Number),
        }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getPortfolioOverview('0xnonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPortfolioPositions', () => {
    it('should return portfolio positions for valid user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.portfolio.findMany.mockResolvedValue([mockPortfolio]);
      mockPrismaService.rule.count.mockResolvedValue(1);

      // Act
      const result = await service.getPortfolioPositions(mockUser.address);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'portfolio123',
          vault: expect.objectContaining({
            id: 'vault123',
            name: 'Aave USDC Vault',
            protocol: 'aave',
            tokenSymbol: 'USDC',
            riskLevel: 'low',
            category: 'stable',
            currentAPY: 5.25,
          }),
          depositAmount: '5000.00',
          currentValue: '5200.00',
          unrealizedPnl: '200.00',
          realizedPnl: '150.00',
          totalDistributed: '100.00',
          avgAPY: 5.8,
          activeRules: 1,
          performancePercentage: 4.0,
        }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getPortfolioPositions('0xnonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactionHistory', () => {
    const mockTransaction = {
      id: 'tx123',
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      type: 'deposit',
      amount: new Decimal('1000'),
      tokenSymbol: 'USDC',
      status: 'confirmed',
      blockNumber: 123456,
      gasUsed: new Decimal('21000'),
      gasFee: new Decimal('0.005'),
      fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
      toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      executedAt: new Date(),
      confirmedAt: new Date(),
      portfolio: {
        vault: mockVault,
      },
    };

    it('should return paginated transaction history', async () => {
      // Arrange
      const query = {
        address: mockUser.address,
        page: 1,
        limit: 20,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      // Act
      const result = await service.getTransactionHistory(query);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          transactions: expect.arrayContaining([
            expect.objectContaining({
              id: 'tx123',
              type: 'deposit',
              amount: '1000.00',
              tokenSymbol: 'USDC',
              status: 'confirmed',
              vault: expect.objectContaining({
                id: 'vault123',
                name: 'Aave USDC Vault',
                protocol: 'aave',
                tokenSymbol: 'USDC',
              }),
            }),
          ]),
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasMore: false,
        }),
      );
    });

    it('should filter transactions by type', async () => {
      // Arrange
      const query = {
        address: mockUser.address,
        type: 'deposit',
        page: 1,
        limit: 20,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      // Act
      const result = await service.getTransactionHistory(query);

      // Assert
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'deposit',
          }),
        }),
      );
      expect(result.transactions).toHaveLength(1);
    });
  });

  describe('exportPortfolioData', () => {
    it('should export portfolio data in JSON format', async () => {
      // Arrange
      const query = {
        address: mockUser.address,
        format: 'json' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.portfolio.findMany.mockResolvedValue([mockPortfolio]);
      mockPrismaService.rule.count.mockResolvedValue(0);

      // Act
      const result = await service.exportPortfolioData(query);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            summary: expect.any(Object),
            transactions: expect.any(Array),
            taxSummary: expect.any(Object),
          }),
          metadata: expect.objectContaining({
            format: 'json',
            generatedAt: expect.any(String),
            totalRecords: 0,
            dateRange: expect.any(Object),
          }),
        }),
      );
    });

    it('should return download URL for CSV format', async () => {
      // Arrange
      const query = {
        address: mockUser.address,
        format: 'csv' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.portfolio.findMany.mockResolvedValue([mockPortfolio]);
      mockPrismaService.rule.count.mockResolvedValue(0);

      // Act
      const result = await service.exportPortfolioData(query);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          downloadUrl: expect.stringContaining('/api/exports/'),
          metadata: expect.objectContaining({
            format: 'csv',
            generatedAt: expect.any(String),
            totalRecords: 0,
            dateRange: expect.any(Object),
          }),
        }),
      );
    });
  });
});
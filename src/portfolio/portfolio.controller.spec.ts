import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let service: PortfolioService;

  const mockPortfolioService = {
    getPortfolioOverview: jest.fn(),
    getPortfolioPositions: jest.fn(),
    getTransactionHistory: jest.fn(),
    exportPortfolioData: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PortfolioController>(PortfolioController);
    service = module.get<PortfolioService>(PortfolioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortfolioOverview', () => {
    it('should return portfolio overview', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const mockOverview = {
        totalValue: '15000.50',
        totalDeposited: '12000.00',
        totalUnrealizedPnl: '2500.30',
        totalRealizedPnl: '500.20',
        totalDistributed: '1200.00',
        avgAPY: 8.5,
        performance: {
          '24h': 2.5,
          '7d': 5.2,
          '30d': 12.8,
          '1y': 45.6,
        },
        activePositions: 3,
        activeRules: 2,
        lastUpdated: '2025-07-13T10:30:00Z',
      };

      mockPortfolioService.getPortfolioOverview.mockResolvedValue(mockOverview);

      // Act
      const result = await controller.getPortfolioOverview(address);

      // Assert
      expect(service.getPortfolioOverview).toHaveBeenCalledWith(address);
      expect(result).toEqual(mockOverview);
    });
  });

  describe('getPortfolioPositions', () => {
    it('should return portfolio positions', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const mockPositions = [
        {
          id: 'portfolio123',
          vault: {
            id: 'vault123',
            name: 'Aave USDC Vault',
            protocol: 'aave',
            tokenSymbol: 'USDC',
            riskLevel: 'low',
            category: 'stable',
            currentAPY: 5.25,
          },
          depositAmount: '5000.00',
          currentValue: '5200.00',
          unrealizedPnl: '200.00',
          realizedPnl: '150.00',
          totalDistributed: '100.00',
          avgAPY: 5.8,
          firstDepositAt: '2024-01-15T10:00:00Z',
          lastUpdated: '2025-07-13T10:30:00Z',
          activeRules: 1,
          performancePercentage: 4.0,
        },
      ];

      mockPortfolioService.getPortfolioPositions.mockResolvedValue(mockPositions);

      // Act
      const result = await controller.getPortfolioPositions(address);

      // Assert
      expect(service.getPortfolioPositions).toHaveBeenCalledWith(address);
      expect(result).toEqual(mockPositions);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history with default parameters', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const mockTransactions = {
        transactions: [
          {
            id: 'tx123',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            type: 'deposit',
            amount: '1000.00',
            tokenSymbol: 'USDC',
            status: 'confirmed',
            blockNumber: 123456,
            gasUsed: '21000',
            gasFee: '0.005',
            fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
            toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
            vault: {
              id: 'vault123',
              name: 'Aave USDC Vault',
              protocol: 'aave',
              tokenSymbol: 'USDC',
            },
            executedAt: '2025-07-13T10:30:00Z',
            confirmedAt: '2025-07-13T10:32:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
      };

      mockPortfolioService.getTransactionHistory.mockResolvedValue(mockTransactions);

      // Act
      const result = await controller.getTransactionHistory(address);

      // Assert
      expect(service.getTransactionHistory).toHaveBeenCalledWith({
        address,
        type: undefined,
        vaultId: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should return transaction history with custom parameters', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const type = 'deposit';
      const vaultId = 'vault123';
      const status = 'confirmed';
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-12-31T23:59:59Z';
      const page = '2';
      const limit = '10';

      const mockTransactions = {
        transactions: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
        hasMore: false,
      };

      mockPortfolioService.getTransactionHistory.mockResolvedValue(mockTransactions);

      // Act
      const result = await controller.getTransactionHistory(
        address,
        type,
        vaultId,
        status,
        startDate,
        endDate,
        page,
        limit,
      );

      // Assert
      expect(service.getTransactionHistory).toHaveBeenCalledWith({
        address,
        type,
        vaultId,
        status,
        startDate,
        endDate,
        page: 2,
        limit: 10,
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('exportPortfolioData', () => {
    it('should export portfolio data with default parameters', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const mockExportResponse = {
        data: {
          summary: {},
          transactions: [],
          taxSummary: {},
        },
        metadata: {
          format: 'csv',
          generatedAt: '2025-07-13T10:30:00Z',
          totalRecords: 0,
          dateRange: {
            start: '2025-01-01T00:00:00Z',
            end: '2025-12-31T23:59:59Z',
          },
        },
      };

      mockPortfolioService.exportPortfolioData.mockResolvedValue(mockExportResponse);

      // Act
      const result = await controller.exportPortfolioData(address);

      // Assert
      expect(service.exportPortfolioData).toHaveBeenCalledWith({
        address,
        format: undefined,
        year: undefined,
        startDate: undefined,
        endDate: undefined,
        taxableOnly: false,
      });
      expect(result).toEqual(mockExportResponse);
    });

    it('should export portfolio data with custom parameters', async () => {
      // Arrange
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const format = 'json';
      const year = '2024';
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-12-31T23:59:59Z';
      const taxableOnly = 'true';

      const mockExportResponse = {
        data: {
          summary: {},
          transactions: [],
          taxSummary: {},
        },
        metadata: {
          format: 'json',
          generatedAt: '2025-07-13T10:30:00Z',
          totalRecords: 0,
          dateRange: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-12-31T23:59:59Z',
          },
        },
      };

      mockPortfolioService.exportPortfolioData.mockResolvedValue(mockExportResponse);

      // Act
      const result = await controller.exportPortfolioData(
        address,
        format,
        year,
        startDate,
        endDate,
        taxableOnly,
      );

      // Assert
      expect(service.exportPortfolioData).toHaveBeenCalledWith({
        address,
        format,
        year: 2024,
        startDate,
        endDate,
        taxableOnly: true,
      });
      expect(result).toEqual(mockExportResponse);
    });
  });
});
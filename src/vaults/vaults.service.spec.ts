import { Test, TestingModule } from '@nestjs/testing';
import { VaultsService } from './vaults.service';
import { PrismaService } from '@/database/prisma.service';
import { ResourceNotFoundException, BusinessException } from '@/common/exceptions/exceptions';
import { createMockPrismaService, testData } from '@test/helpers/test-utils';

describe('VaultsService', () => {
  let service: VaultsService;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VaultsService>(VaultsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated vaults with default parameters', async () => {
      const mockVaults = [
        testData.createVaultData({ id: 'vault1', name: 'USDC Vault', apy: 5.5 }),
        testData.createVaultData({ id: 'vault2', name: 'ETH Vault', apy: 7.2 }),
      ];

      prismaService.vault.findMany.mockResolvedValue(mockVaults);
      prismaService.vault.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result).toEqual({
        vaults: expect.arrayContaining([
          expect.objectContaining({ name: 'USDC Vault' }),
          expect.objectContaining({ name: 'ETH Vault' }),
        ]),
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      expect(prismaService.vault.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { apy: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should apply search filter correctly', async () => {
      const mockVaults = [
        testData.createVaultData({ name: 'USDC Vault', protocol: 'aave' }),
      ];

      prismaService.vault.findMany.mockResolvedValue(mockVaults);
      prismaService.vault.count.mockResolvedValue(1);

      await service.findAll({ search: 'USDC' });

      expect(prismaService.vault.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'USDC', mode: 'insensitive' } },
              { protocol: { contains: 'USDC', mode: 'insensitive' } },
              { tokenSymbol: { contains: 'USDC', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should apply APY range filter correctly', async () => {
      const mockVaults = [testData.createVaultData()];

      prismaService.vault.findMany.mockResolvedValue(mockVaults);
      prismaService.vault.count.mockResolvedValue(1);

      await service.findAll({ minAPY: 5, maxAPY: 10 });

      expect(prismaService.vault.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            apy: { gte: 5, lte: 10 },
          }),
        }),
      );
    });

    it('should validate pagination parameters', async () => {
      await expect(service.findAll({ page: 0 })).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findAll({ page: -1 })).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findAll({ limit: 0 })).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findAll({ limit: 101 })).rejects.toThrow(
        BusinessException,
      );
    });

    it('should validate APY range parameters', async () => {
      await expect(service.findAll({ minAPY: -1 })).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findAll({ maxAPY: -1 })).rejects.toThrow(
        BusinessException,
      );
      await expect(
        service.findAll({ minAPY: 10, maxAPY: 5 }),
      ).rejects.toThrow(BusinessException);
    });

    it('should handle database errors gracefully', async () => {
      prismaService.vault.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll({})).rejects.toThrow(BusinessException);
    });

    it('should apply sorting correctly', async () => {
      const mockVaults = [testData.createVaultData()];

      prismaService.vault.findMany.mockResolvedValue(mockVaults);
      prismaService.vault.count.mockResolvedValue(1);

      await service.findAll({ sortBy: 'name', sortOrder: 'asc' });

      expect(prismaService.vault.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should use default sorting for invalid sort parameters', async () => {
      const mockVaults = [testData.createVaultData()];

      prismaService.vault.findMany.mockResolvedValue(mockVaults);
      prismaService.vault.count.mockResolvedValue(1);

      await service.findAll({ sortBy: 'invalid', sortOrder: 'invalid' });

      expect(prismaService.vault.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { apy: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return vault when found', async () => {
      const mockVault = testData.createVaultData({
        id: 'valid-cuid',
        name: 'Test Vault',
      });

      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      const result = await service.findOne('valid-cuid');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'valid-cuid',
          name: 'Test Vault',
        }),
      );

      expect(prismaService.vault.findUnique).toHaveBeenCalledWith({
        where: { id: 'valid-cuid' },
      });
    });

    it('should throw ResourceNotFoundException when vault not found', async () => {
      prismaService.vault.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('should validate vault ID', async () => {
      await expect(service.findOne('')).rejects.toThrow(BusinessException);
      await expect(service.findOne('   ')).rejects.toThrow(BusinessException);
      await expect(service.findOne(null as any)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findOne(undefined as any)).rejects.toThrow(
        BusinessException,
      );
    });

    it('should trim vault ID', async () => {
      const mockVault = testData.createVaultData({ id: 'valid-cuid' });
      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      await service.findOne('  valid-cuid  ');

      expect(prismaService.vault.findUnique).toHaveBeenCalledWith({
        where: { id: 'valid-cuid' },
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.vault.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne('valid-cuid')).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('findByAddress', () => {
    const validAddress = testData.validVaultAddress;

    it('should return vault when found by address', async () => {
      const mockVault = testData.createVaultData({
        address: validAddress,
        name: 'Test Vault',
      });

      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      const result = await service.findByAddress(validAddress);

      expect(result).toEqual(
        expect.objectContaining({
          address: validAddress,
          name: 'Test Vault',
        }),
      );

      expect(prismaService.vault.findUnique).toHaveBeenCalledWith({
        where: { address: validAddress.toLowerCase() },
      });
    });

    it('should throw ResourceNotFoundException when vault not found', async () => {
      prismaService.vault.findUnique.mockResolvedValue(null);

      await expect(service.findByAddress(validAddress)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('should validate Ethereum address format', async () => {
      await expect(service.findByAddress('')).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findByAddress('invalid-address')).rejects.toThrow(
        BusinessException,
      );
      await expect(service.findByAddress('0xinvalid')).rejects.toThrow(
        BusinessException,
      );
      await expect(
        service.findByAddress('0x123456789012345678901234567890123456789'),
      ).rejects.toThrow(BusinessException);
    });

    it('should normalize address to lowercase', async () => {
      const upperCaseAddress = validAddress.toUpperCase();
      const mockVault = testData.createVaultData({ address: validAddress });
      
      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      await service.findByAddress(upperCaseAddress);

      expect(prismaService.vault.findUnique).toHaveBeenCalledWith({
        where: { address: validAddress.toLowerCase() },
      });
    });

    it('should trim address', async () => {
      const mockVault = testData.createVaultData({ address: validAddress });
      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      await service.findByAddress(`  ${validAddress}  `);

      expect(prismaService.vault.findUnique).toHaveBeenCalledWith({
        where: { address: validAddress.toLowerCase() },
      });
    });
  });

  describe('getVaultPerformance', () => {
    it('should return performance data for existing vault', async () => {
      const mockVault = testData.createVaultData({
        id: 'valid-cuid',
        apy: 5.5,
      });

      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      const result = await service.getVaultPerformance('valid-cuid');

      expect(result).toEqual({
        vaultId: 'valid-cuid',
        currentAPY: 5.5,
        historicalAPY: [],
        tvlHistory: [],
        lastUpdated: expect.any(Date),
      });
    });

    it('should throw error for non-existent vault', async () => {
      prismaService.vault.findUnique.mockResolvedValue(null);

      await expect(service.getVaultPerformance('non-existent')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('transformVaultToDto', () => {
    it('should transform vault entity to DTO correctly', async () => {
      const mockVault = {
        ...testData.createVaultData(),
        tvl: '1000000.50', // Decimal as string
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      prismaService.vault.findUnique.mockResolvedValue(mockVault);

      const result = await service.findOne('valid-cuid');

      expect(result).toEqual({
        id: mockVault.id,
        name: mockVault.name,
        address: mockVault.address,
        protocol: mockVault.protocol,
        tokenAddress: mockVault.tokenAddress,
        tokenSymbol: mockVault.tokenSymbol,
        apy: mockVault.apy,
        riskLevel: mockVault.riskLevel,
        category: mockVault.category,
        tvl: '1000000.50',
        active: mockVault.active,
        insuranceAvailable: mockVault.insuranceAvailable,
        autoCompounding: mockVault.autoCompounding,
        withdrawalTerms: mockVault.withdrawalTerms,
        createdAt: mockVault.createdAt,
        updatedAt: mockVault.updatedAt,
      });
    });
  });
});

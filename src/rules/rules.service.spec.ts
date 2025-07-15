import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RulesService } from './rules.service';
import { PrismaService } from '../database/prisma.service';
import { CreateRuleDto, UpdateRuleDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

describe('RulesService', () => {
  let service: RulesService;
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
    tokenSymbol: 'USDC',
    riskLevel: 'low',
    category: 'stable',
    apy: 5.25,
    tvl: new Decimal('1000000'),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRule = {
    id: 'rule123',
    name: 'Monthly Distribution',
    description: 'Monthly profit distribution rule',
    userId: 'user123',
    vaultId: 'vault123',
    trigger: 'monthly',
    profitThreshold: null,
    active: true,
    lastExecuted: null,
    nextExecution: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    distributions: [
      {
        id: 'dist1',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
        percentage: 60,
        description: 'Main wallet',
        type: 'wallet',
      },
      {
        id: 'dist2',
        recipient: 'reinvest',
        percentage: 40,
        description: 'Reinvestment',
        type: 'reinvest',
      },
    ],
    vault: mockVault,
    executions: [],
    user: mockUser,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    vault: {
      findUnique: jest.fn(),
    },
    rule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ruleExecution: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRule', () => {
    const createRuleDto: CreateRuleDto = {
      name: 'Test Rule',
      description: 'Test description',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      vaultId: 'vault123',
      trigger: 'monthly',
      distributions: [
        {
          recipient: '0x1234567890abcdef1234567890abcdef12345678',
          percentage: 60,
          description: 'Main wallet',
          type: 'wallet',
        },
        {
          recipient: 'reinvest',
          percentage: 40,
          description: 'Reinvestment',
          type: 'reinvest',
        },
      ],
    };

    it('should create a rule successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.vault.findUnique.mockResolvedValue(mockVault);
      mockPrismaService.rule.create.mockResolvedValue(mockRule);

      // Act
      const result = await service.createRule(createRuleDto);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 'rule123',
          name: 'Monthly Distribution',
          trigger: 'monthly',
          distributions: expect.arrayContaining([
            expect.objectContaining({
              recipient: '0x1234567890abcdef1234567890abcdef12345678',
              percentage: 60,
            }),
            expect.objectContaining({
              recipient: 'reinvest',
              percentage: 40,
            }),
          ]),
        }),
      );
      expect(mockPrismaService.rule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Rule',
            description: 'Test description',
            userId: 'user123',
            vaultId: 'vault123',
            trigger: 'monthly',
          }),
        }),
      );
    });

    it('should create user if not exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.vault.findUnique.mockResolvedValue(mockVault);
      mockPrismaService.rule.create.mockResolvedValue(mockRule);

      // Act
      await service.createRule(createRuleDto);

      // Assert
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { address: '0x1234567890abcdef1234567890abcdef12345678' },
      });
    });

    it('should throw NotFoundException when vault not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.vault.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createRule(createRuleDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when percentages do not sum to 100', async () => {
      // Arrange
      const invalidRuleDto = {
        ...createRuleDto,
        distributions: [
          {
            recipient: '0x1234567890abcdef1234567890abcdef12345678',
            percentage: 50,
            description: 'Main wallet',
            type: 'wallet',
          },
          {
            recipient: 'reinvest',
            percentage: 30, // Total = 80%, not 100%
            description: 'Reinvestment',
            type: 'reinvest',
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.vault.findUnique.mockResolvedValue(mockVault);

      // Act & Assert
      await expect(service.createRule(invalidRuleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRules', () => {
    const filterDto = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
    };

    it('should return user rules', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findMany.mockResolvedValue([mockRule]);

      // Act
      const result = await service.getRules(filterDto);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({
              id: 'rule123',
              name: 'Monthly Distribution',
            }),
          ]),
          total: 1,
          activeCount: 1,
          inactiveCount: 0,
        }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getRules(filterDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRule', () => {
    const updateRuleDto: UpdateRuleDto = {
      name: 'Updated Rule Name',
      trigger: 'weekly',
    };

    it('should update rule successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(mockRule);
      mockPrismaService.rule.update.mockResolvedValue({
        ...mockRule,
        name: 'Updated Rule Name',
        trigger: 'weekly',
      });

      // Act
      const result = await service.updateRule(
        'rule123',
        updateRuleDto,
        '0x1234567890abcdef1234567890abcdef12345678',
      );

      // Assert
      expect(result.name).toBe('Updated Rule Name');
      expect(result.trigger).toBe('weekly');
    });

    it('should throw NotFoundException when rule not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRule(
          'nonexistent',
          updateRuleDto,
          '0x1234567890abcdef1234567890abcdef12345678',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRule', () => {
    it('should delete rule successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(mockRule);
      mockPrismaService.rule.delete.mockResolvedValue(mockRule);

      // Act
      await service.deleteRule(
        'rule123',
        '0x1234567890abcdef1234567890abcdef12345678',
      );

      // Assert
      expect(mockPrismaService.rule.delete).toHaveBeenCalledWith({
        where: { id: 'rule123' },
      });
    });

    it('should throw NotFoundException when rule not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteRule(
          'nonexistent',
          '0x1234567890abcdef1234567890abcdef12345678',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleRule', () => {
    it('should toggle rule active status', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(mockRule);
      mockPrismaService.rule.update.mockResolvedValue({
        ...mockRule,
        active: false,
      });

      // Act
      const result = await service.toggleRule(
        'rule123',
        '0x1234567890abcdef1234567890abcdef12345678',
      );

      // Assert
      expect(result.active).toBe(false);
      expect(mockPrismaService.rule.update).toHaveBeenCalledWith({
        where: { id: 'rule123' },
        data: { active: false },
        include: expect.any(Object),
      });
    });
  });

  describe('executeRule', () => {
    it('should execute rule successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(mockRule);
      mockPrismaService.ruleExecution.create.mockResolvedValue({
        id: 'exec123',
        ruleId: 'rule123',
        executedAt: new Date(),
        profitAmount: new Decimal(500),
        gasUsed: new Decimal(0.005),
        gasFee: new Decimal(0.001),
        transactions: [],
        status: 'completed',
        errorMessage: null,
        performanceFee: new Decimal(2.5),
      });
      mockPrismaService.rule.update.mockResolvedValue(mockRule);

      // Act
      const result = await service.executeRule(
        'rule123',
        '0x1234567890abcdef1234567890abcdef12345678',
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          result: 'success',
          execution: expect.objectContaining({
            id: 'exec123',
            ruleId: 'rule123',
            status: 'completed',
          }),
        }),
      );
    });

    it('should throw BadRequestException when rule is not active', async () => {
      // Arrange
      const inactiveRule = { ...mockRule, active: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rule.findFirst.mockResolvedValue(inactiveRule);

      // Act & Assert
      await expect(
        service.executeRule(
          'rule123',
          '0x1234567890abcdef1234567890abcdef12345678',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
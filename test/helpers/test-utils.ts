import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

export interface TestUser {
  id: string;
  address: string;
  accessToken: string;
}

export interface TestVault {
  id: string;
  address: string;
  name: string;
  protocol: string;
  tokenSymbol: string;
  apy: number;
  riskLevel: string;
}

export class TestHelper {
  private app: INestApplication;
  private prisma: PrismaService;
  private jwtService: JwtService;
  
  constructor(app: INestApplication) {
    this.app = app;
    this.prisma = app.get(PrismaService);
    this.jwtService = app.get(JwtService);
  }

  /**
   * Create a test user with authentication token
   */
  async createTestUser(address = '0x742d35Cc6634C0532925a3b8D8A4e31D0f9A2030'): Promise<TestUser> {
    const user = await this.prisma.user.create({
      data: {
        address: address.toLowerCase(),
      },
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      address: user.address,
    });

    return {
      id: user.id,
      address: user.address,
      accessToken,
    };
  }

  /**
   * Create a test vault
   */
  async createTestVault(overrides: Partial<TestVault> = {}): Promise<TestVault> {
    const vaultData = {
      name: 'Test USDC Vault',
      address: '0x1234567890123456789012345678901234567890',
      protocol: 'aave',
      tokenAddress: '0xa0b86a33e6ba2e4c8ef4e6a0f3b8f7a2e9c7a3f1',
      tokenSymbol: 'USDC',
      apy: 5.5,
      riskLevel: 'medium',
      tvl: '1000000',
      active: true,
      ...overrides,
    };

    const vault = await this.prisma.vault.create({
      data: vaultData,
    });

    return {
      id: vault.id,
      address: vault.address,
      name: vault.name,
      protocol: vault.protocol,
      tokenSymbol: vault.tokenSymbol,
      apy: vault.apy,
      riskLevel: vault.riskLevel,
    };
  }

  /**
   * Create a test rule for a user and vault
   */
  async createTestRule(userId: string, vaultId: string, overrides = {}) {
    const ruleData = {
      name: 'Test Monthly Distribution',
      description: 'Test automation rule',
      userId,
      vaultId,
      trigger: 'monthly',
      active: true,
      ...overrides,
    };

    return await this.prisma.rule.create({
      data: ruleData,
      include: {
        distributions: true,
        vault: true,
        user: true,
      },
    });
  }

  /**
   * Create test distributions for a rule
   */
  async createTestDistributions(ruleId: string, distributions = []) {
    const defaultDistributions = [
      {
        ruleId,
        recipient: '0x742d35Cc6634C0532925a3b8D8A4e31D0f9A2030',
        percentage: 60,
        description: 'Main wallet',
      },
      {
        ruleId,
        recipient: '0x8ba1f109551bD432803012645Hac136c86443328',
        percentage: 40,
        description: 'Savings wallet',
      },
    ];

    const distributionsToCreate = distributions.length > 0 ? distributions : defaultDistributions;

    return await this.prisma.distribution.createMany({
      data: distributionsToCreate,
    });
  }

  /**
   * Create a test portfolio for a user and vault
   */
  async createTestPortfolio(userId: string, vaultId: string, overrides = {}) {
    const portfolioData = {
      userId,
      vaultId,
      depositAmount: '1000',
      currentValue: '1050',
      unrealizedPnl: '50',
      realizedPnl: '0',
      ...overrides,
    };

    return await this.prisma.portfolio.create({
      data: portfolioData,
      include: {
        vault: true,
        user: true,
      },
    });
  }

  /**
   * Clean all test data
   */
  async cleanDatabase(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.ruleExecution.deleteMany(),
      this.prisma.distribution.deleteMany(),
      this.prisma.rule.deleteMany(),
      this.prisma.portfolio.deleteMany(),
      this.prisma.vault.deleteMany(),
      this.prisma.user.deleteMany(),
      this.prisma.platformAnalytics.deleteMany(),
    ]);
  }

  /**
   * Get authentication headers for a user
   */
  getAuthHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Wait for a specified amount of time (useful for async operations)
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a test application with proper configuration
 */
export async function createTestApp(moduleClass: any): Promise<{
  app: INestApplication;
  helper: TestHelper;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [moduleClass],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply the same global pipes as the main application
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

  await app.init();

  const helper = new TestHelper(app);

  return { app, helper };
}

/**
 * Mock Prisma service for unit tests
 */
export const createMockPrismaService = () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vault: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  rule: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  portfolio: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  distribution: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ruleExecution: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  platformAnalytics: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
});

/**
 * Common test data factories
 */
export const testData = {
  validAddress: '0x742d35Cc6634C0532925a3b8D8A4e31D0f9A2030',
  invalidAddress: '0xinvalid',
  validVaultAddress: '0x1234567890123456789012345678901234567890',
  validTokenAddress: '0xa0b86a33e6ba2e4c8ef4e6a0f3b8f7a2e9c7a3f1',
  
  createUserData: (overrides = {}) => ({
    address: testData.validAddress,
    ...overrides,
  }),
  
  createVaultData: (overrides = {}) => ({
    name: 'Test USDC Vault',
    address: testData.validVaultAddress,
    protocol: 'aave',
    tokenAddress: testData.validTokenAddress,
    tokenSymbol: 'USDC',
    apy: 5.5,
    riskLevel: 'medium',
    tvl: '1000000',
    active: true,
    ...overrides,
  }),
  
  createRuleData: (userId: string, vaultId: string, overrides = {}) => ({
    name: 'Test Monthly Distribution',
    description: 'Test automation rule',
    userId,
    vaultId,
    trigger: 'monthly',
    active: true,
    ...overrides,
  }),
};
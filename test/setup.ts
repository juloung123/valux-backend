import { PrismaClient } from '@prisma/client';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/valux_test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  
  // Initialize test database
  const prisma = new PrismaClient();
  
  try {
    // Clear all data before tests
    await prisma.$transaction([
      prisma.ruleExecution.deleteMany(),
      prisma.distribution.deleteMany(),
      prisma.rule.deleteMany(),
      prisma.portfolio.deleteMany(),
      prisma.vault.deleteMany(),
      prisma.user.deleteMany(),
      prisma.platformAnalytics.deleteMany(),
    ]);
  } catch (error) {
    console.warn('Warning: Could not clear test database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
});

afterAll(async () => {
  // Cleanup after all tests
  const prisma = new PrismaClient();
  
  try {
    // Clean up test data
    await prisma.$transaction([
      prisma.ruleExecution.deleteMany(),
      prisma.distribution.deleteMany(),
      prisma.rule.deleteMany(),
      prisma.portfolio.deleteMany(),
      prisma.vault.deleteMany(),
      prisma.user.deleteMany(),
      prisma.platformAnalytics.deleteMany(),
    ]);
  } catch (error) {
    console.warn('Warning: Could not cleanup test database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
});

// Global test helpers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidAddress(): R;
      toBeValidDecimal(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidAddress(received: string) {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    const pass = addressRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Ethereum address`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Ethereum address`,
        pass: false,
      };
    }
  },
  
  toBeValidDecimal(received: any) {
    const pass = typeof received === 'string' || typeof received === 'number';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid decimal`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid decimal`,
        pass: false,
      };
    }
  },
});
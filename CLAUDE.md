# Valux.finance Backend Development Guide

**Complete Developer Handbook for Enterprise-Grade NestJS Backend**

---

## 📋 **Project Overview**

Valux.finance backend is a **production-ready NestJS application** designed for DeFi automation on Arbitrum. The system provides comprehensive APIs for vault management, automation rules, portfolio tracking, and blockchain interactions.

### **Current Status: Foundation Complete (40% Implementation)**

- ✅ **Architecture & Infrastructure**: Production-ready setup
- ✅ **Database Schema**: Complete 8-table design  
- ✅ **Authentication System**: JWT + Web3 signature verification
- ⚠️ **Feature APIs**: 40% implemented (Vaults complete, Rules/Portfolio partial)
- ❌ **Advanced Features**: Analytics, real-time, automation pending

---

## 🏗️ **Architecture & Project Structure**

### **Tech Stack**
```typescript
Framework:     NestJS ^10.0 (Express-based)
Language:      TypeScript ^5.0 (strict mode)
Database:      PostgreSQL 15+ with Prisma ORM ^6.0
Caching:       Redis 7+ (configured, not fully utilized)
Web3:          ethers.js v6 for Arbitrum interactions
Queue:         Bull Queue ^4.0 (configured, not implemented)
Testing:       Jest ^29.0 + Supertest for E2E
Validation:    class-validator + class-transformer
Documentation: Swagger/OpenAPI auto-generation
```

### **Professional Directory Structure**
```
valux-backend/
├── 🏗️ src/                           # Source code
│   ├── 📱 app.module.ts               # Root application module
│   ├── 🚀 main.ts                     # Application entry point with server management
│   │
│   ├── 🔐 auth/                       # Authentication & Authorization (90% Complete)
│   │   ├── auth.module.ts             # Auth module configuration
│   │   ├── auth.service.ts            # JWT + Web3 signature logic
│   │   ├── auth.controller.ts         # Login, logout, profile endpoints
│   │   ├── 🔒 guards/                 # Auth guards and strategies
│   │   │   ├── jwt-auth.guard.ts      # JWT authentication guard
│   │   │   └── local-auth.guard.ts    # Local authentication guard
│   │   ├── 🔑 strategies/             # Passport strategies
│   │   │   └── jwt.strategy.ts        # JWT validation strategy
│   │   └── 📝 dto/                    # Data transfer objects
│   │       └── login.dto.ts           # Auth DTOs with validation
│   │
│   ├── 🏦 vaults/                     # Vault Management (60% Complete)
│   │   ├── vaults.module.ts           # Vault module configuration
│   │   ├── vaults.service.ts          # Business logic for vault operations
│   │   ├── vaults.controller.ts       # REST API endpoints
│   │   └── 📝 dto/                    # Request/response DTOs
│   │       ├── vault.dto.ts           # Vault entity DTOs
│   │       └── vault-filter.dto.ts    # Advanced filtering DTOs
│   │
│   ├── ⚙️ rules/                      # Automation Rules Engine (20% Complete - Schema Only)
│   │   ├── rules.module.ts            # Module configuration (basic)
│   │   ├── rules.service.ts           # 🚧 TODO: Business logic implementation
│   │   ├── rules.controller.ts        # 🚧 TODO: API endpoints
│   │   ├── 🎯 execution/              # 🚧 TODO: Rule execution engine
│   │   └── 📝 dto/                    # 🚧 TODO: Rule management DTOs
│   │
│   ├── 📊 portfolio/                  # Portfolio Management (30% Complete - Schema Only)
│   │   ├── portfolio.module.ts        # Module configuration (basic)
│   │   ├── portfolio.service.ts       # 🚧 TODO: P&L calculations
│   │   ├── portfolio.controller.ts    # 🚧 TODO: Portfolio endpoints
│   │   └── 📝 dto/                    # 🚧 TODO: Portfolio DTOs
│   │
│   ├── 📈 analytics/                  # Platform Analytics (0% Complete)
│   │   ├── analytics.module.ts        # 🚧 TODO: Analytics module
│   │   ├── analytics.service.ts       # 🚧 TODO: Data aggregation
│   │   ├── analytics.controller.ts    # 🚧 TODO: Metrics endpoints
│   │   └── 📝 dto/                    # 🚧 TODO: Analytics DTOs
│   │
│   ├── 🔗 blockchain/                 # Web3 Integration (10% Complete)
│   │   ├── blockchain.module.ts       # Module configuration (basic)
│   │   ├── blockchain.service.ts      # 🚧 TODO: Smart contract interactions
│   │   ├── 📄 contracts/              # 🚧 TODO: Contract ABIs and interfaces
│   │   └── 🌐 providers/              # 🚧 TODO: RPC provider management
│   │
│   ├── 🛠️ common/                     # Shared Infrastructure (100% Complete)
│   │   ├── 🎨 decorators/             # Custom decorators
│   │   │   ├── api-response.decorator.ts    # Swagger response decorators
│   │   │   └── validation.decorator.ts      # Custom validation decorators
│   │   ├── 🚨 exceptions/             # Custom exception classes
│   │   │   └── exceptions.ts          # Business, validation, auth exceptions
│   │   ├── 🔍 filters/                # Global exception filters
│   │   │   └── global-exception.filter.ts  # Comprehensive error handling
│   │   ├── 🔄 interceptors/           # Request/response interceptors
│   │   │   ├── logging.interceptor.ts       # Request logging
│   │   │   └── transform.interceptor.ts     # Response transformation
│   │   ├── 🛡️ guards/                 # Security guards
│   │   ├── 🔧 pipes/                  # Validation pipes
│   │   ├── 🏥 health/                 # Health check indicators
│   │   │   └── indicators/            # Database, Redis, Blockchain health
│   │   ├── 📊 metrics/                # Prometheus metrics
│   │   │   ├── metrics.service.ts     # Business metrics collection
│   │   │   └── metrics.controller.ts  # Metrics endpoint
│   │   ├── 📝 logger/                 # Winston logging setup
│   │   │   ├── logger.service.ts      # Custom logger service
│   │   │   └── logger.module.ts       # Logging configuration
│   │   └── 🎯 types/                  # Shared TypeScript types
│   │
│   ├── ⚙️ config/                     # Configuration Management (100% Complete)
│   │   ├── config.module.ts           # Global configuration module
│   │   └── configuration.ts           # Typed configuration objects
│   │
│   └── 🗄️ database/                   # Database Management (100% Complete)
│       ├── prisma.service.ts          # Prisma client service
│       ├── 🔄 migrations/             # Database migrations
│       └── 🌱 seeders/                # Database seeders
│
├── 🗄️ prisma/                         # Database Schema & Migrations
│   ├── schema.prisma                  # Complete database schema (8 tables)
│   └── migrations/                    # Migration history
│
├── 🧪 test/                           # Testing Infrastructure
│   ├── setup.ts                      # Global test configuration
│   ├── helpers/                      # Test utilities and factories
│   │   └── test-utils.ts             # Mock services and data factories
│   └── app.e2e-spec.ts               # End-to-end application tests
│
├── 📁 logs/                           # Application logs (generated)
├── 📄 .env                           # Environment variables
├── 📄 .env.example                   # Environment template
├── 📖 README.md                      # Project documentation
├── 📖 CLAUDE.md                      # This development guide
├── 📄 package.json                   # Dependencies and scripts
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 jest.config.js                 # Jest testing configuration
├── 📄 nest-cli.json                  # NestJS CLI configuration
└── 📄 docker-compose.yml             # Development environment setup
```

---

## 🗄️ **Database Architecture**

### **Complete Schema Design** (100% Implemented)

#### **Core Tables**
```sql
-- 👤 User Management
users {
  id: String @id @default(cuid())
  address: String @unique               -- Ethereum wallet address
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  -- Relations
  rules: Rule[]
  portfolios: Portfolio[]
}

-- 🏦 DeFi Vaults  
vaults {
  id: String @id @default(cuid())
  name: String                         -- "Aave USDC Vault"
  address: String @unique              -- Smart contract address
  protocol: String                     -- "aave", "compound", "lido"
  tokenAddress: String                 -- Underlying token contract
  tokenSymbol: String                  -- "USDC", "ETH", "DAI"
  apy: Float                          -- Current annual percentage yield
  riskLevel: String                   -- "low", "medium", "high"
  category: String                    -- "stable", "yield", "growth"
  tvl: Decimal(20,8)                  -- Total value locked
  active: Boolean @default(true)
  insuranceAvailable: Boolean
  autoCompounding: Boolean
  withdrawalTerms: String?            -- "instant", "7days", "30days"
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  -- Relations
  rules: Rule[]
  portfolios: Portfolio[]
  performance: VaultPerformance[]
  
  -- Indexes for performance
  @@index([protocol, active])
  @@index([riskLevel, apy])
  @@index([category, tvl])
}

-- 📊 Historical Performance Data
vault_performance {
  id: String @id @default(cuid())
  vaultId: String
  apy: Float                          -- APY at this timestamp
  tvl: Decimal(20,8)                  -- TVL at this timestamp
  timestamp: DateTime @default(now())
  
  vault: Vault @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  
  @@index([vaultId, timestamp])
}
```

#### **Automation Engine Tables**
```sql
-- ⚙️ Automation Rules
rules {
  id: String @id @default(cuid())
  name: String                        -- "Monthly Profit Distribution"
  description: String?
  userId: String
  vaultId: String
  trigger: String                     -- "monthly", "weekly", "profit_threshold"
  triggerValue: Decimal(20,8)?        -- Threshold amount for profit_threshold
  active: Boolean @default(true)
  lastExecuted: DateTime?
  nextExecution: DateTime?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  -- Relations
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault: Vault @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  distributions: Distribution[]
  executions: RuleExecution[]
  
  @@index([userId, active])
  @@index([vaultId, nextExecution])
}

-- 📋 Distribution Configuration
distributions {
  id: String @id @default(cuid())
  ruleId: String
  recipient: String                   -- Wallet address
  percentage: Float                   -- 0-100 (must sum to 100 per rule)
  description: String?                -- "Emergency fund", "Investment account"
  
  rule: Rule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId])
}

-- ⚡ Execution History
rule_executions {
  id: String @id @default(cuid())
  ruleId: String
  executedAt: DateTime @default(now())
  profitAmount: Decimal(20,8)        -- Total profit distributed
  gasUsed: Decimal(20,8)?            -- Gas fees paid
  transactionHashes: Json            -- Array of transaction hashes
  status: String                     -- "completed", "failed", "pending"
  errorMessage: String?              -- Error details if failed
  executionTimeMs: Int?              -- Execution duration
  
  rule: Rule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  @@index([ruleId, executedAt])
  @@index([status, executedAt])
}
```

#### **Portfolio & Trading Tables**
```sql
-- 💼 User Portfolio Positions
portfolios {
  id: String @id @default(cuid())
  userId: String
  vaultId: String
  depositAmount: Decimal(20,8)       -- Total deposited
  currentValue: Decimal(20,8)        -- Current vault token value
  unrealizedPnl: Decimal(20,8)       -- Unrealized profit/loss
  realizedPnl: Decimal(20,8)         -- Realized profit/loss from withdrawals
  lastUpdated: DateTime @default(now())
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault: Vault @relation(fields: [vaultId], references: [id], onDelete: Cascade)
  
  @@unique([userId, vaultId])
  @@index([userId])
}

-- 💸 Transaction History
transactions {
  id: String @id @default(cuid())
  userId: String
  vaultId: String?
  type: String                       -- "deposit", "withdraw", "distribution", "automation"
  amount: Decimal(20,8)
  tokenSymbol: String               -- "USDC", "ETH"
  transactionHash: String @unique   -- Blockchain transaction hash
  blockNumber: Int
  gasUsed: Decimal(20,8)
  gasPriceGwei: Decimal(20,8)
  status: String                    -- "pending", "confirmed", "failed"
  timestamp: DateTime @default(now())
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  vault: Vault? @relation(fields: [vaultId], references: [id], onDelete: SetNull)
  
  @@index([userId, timestamp])
  @@index([transactionHash])
  @@index([status, timestamp])
}

-- 📈 Platform Analytics
platform_analytics {
  id: String @id @default(cuid())
  date: DateTime @default(now())
  totalUsers: Int                   -- Total registered users
  activeUsers: Int                  -- Users active in last 30 days
  totalTvl: Decimal(20,8)          -- Platform total value locked
  totalVolume: Decimal(20,8)       -- 24h volume
  rulesExecuted: Int               -- Rules executed today
  avgExecutionTime: Float          -- Average rule execution time (seconds)
  
  @@unique([date])
  @@index([date])
}
```

### **Database Features**

#### **Financial Precision**
- All monetary values use `Decimal(20,8)` for precise financial calculations
- No floating-point arithmetic for money to prevent rounding errors
- Support for values up to 999,999,999,999.99999999

#### **Performance Optimization**
```sql
-- Strategic indexes for common queries
@@index([protocol, active])          -- Filter vaults by protocol
@@index([riskLevel, apy])            -- Sort by risk and APY
@@index([userId, timestamp])         -- User activity history
@@index([vaultId, nextExecution])    -- Automation scheduling
```

#### **Data Integrity**
- Cascade deletes maintain referential integrity
- Unique constraints prevent duplicate data
- Foreign key relationships enforce consistency
- Audit trails with `createdAt`/`updatedAt` timestamps

---

## 🔧 **Environment Configuration**

### **Development Environment Setup**

#### **Required Environment Variables**
```bash
# 🗄️ Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/valux_db"

# 🔴 Redis Configuration (Session & Queue Management)
REDIS_URL="redis://localhost:6379"
QUEUE_REDIS_URL="redis://localhost:6379"

# ⛓️ Blockchain Configuration
ARBITRUM_RPC_URL="https://arb1.arbitrum.io/rpc"
PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000001"  # Dev placeholder
CHAINLINK_AUTOMATION_REGISTRY="0x0000000000000000000000000000000000000000"  # Dev placeholder

# 🔒 Authentication & Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
SESSION_SECRET="your-session-secret-key-for-development"

# 🌐 API Configuration
PORT=8080
API_PREFIX="api"
CORS_ORIGIN="http://localhost:3000"

# 🔄 Feature Flags
AUTOMATION_ENABLED=true
NODE_ENV="development"
LOG_LEVEL="info"
ENABLE_SWAGGER=true

# 📊 Monitoring (Optional)
SENTRY_DSN=""                        # Error tracking
PROMETHEUS_ENABLED=true
METRICS_PATH="/metrics"
```

#### **Production Environment Variables**
```bash
# 🚨 Production Security Requirements
JWT_SECRET="<256-bit-random-key>"
SESSION_SECRET="<256-bit-random-key>"
PRIVATE_KEY="<real-private-key-for-automation>"
CHAINLINK_AUTOMATION_REGISTRY="<actual-registry-address>"

# 🗄️ Production Database
DATABASE_URL="postgresql://username:password@prod-db:5432/valux_production"
REDIS_URL="redis://prod-redis:6379"

# 🔒 Production Security
NODE_ENV="production"
LOG_LEVEL="warn"
ENABLE_SWAGGER=false

# 📊 Production Monitoring
SENTRY_DSN="<production-sentry-dsn>"
PROMETHEUS_ENABLED=true
```

### **Configuration Validation**

The application uses **Joi schema validation** to ensure all required environment variables are present:

```typescript
// src/config/configuration.ts
export const configurationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // Redis
  REDIS_URL: Joi.string().required(),
  
  // Blockchain
  ARBITRUM_RPC_URL: Joi.string().uri().required(),
  PRIVATE_KEY: Joi.string().pattern(/^0x[0-9a-fA-F]{64}$/).required(),
  
  // Authentication
  JWT_SECRET: Joi.string().min(32).required(),
  SESSION_SECRET: Joi.string().min(32).required(),
  
  // API
  PORT: Joi.number().port().default(8080),
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
})
```

---

## 📖 **API Documentation**

### **Swagger/OpenAPI Integration** (100% Complete)

#### **Interactive Documentation**
```typescript
// Available at: http://localhost:8080/api/docs
- Complete API documentation with examples
- Interactive endpoint testing
- Request/response schema validation
- Authentication flow documentation
- Error response examples
```

#### **API Response Decorators**
```typescript
// Custom decorators for consistent documentation
@ApiSuccessResponse(VaultDto, 'Successfully retrieved vault details')
@ApiErrorResponse(400, 'Invalid vault ID format')
@ApiErrorResponse(404, 'Vault not found')
@ApiErrorResponse(500, 'Internal server error')
```

### **Currently Implemented APIs**

#### **🔒 Authentication Endpoints** (90% Complete)
```typescript
/**
 * Generate nonce for wallet authentication
 * GET /api/auth/nonce?address=0x...
 */
GET    /api/auth/nonce          
Response: { nonce: string, message: string }

/**
 * Web3 signature-based login
 * POST /api/auth/login
 */
POST   /api/auth/login          
Body: { address: string, signature: string, message: string }
Response: { access_token: string, refresh_token: string, user: UserDto, expires_in: number }

/**
 * Refresh JWT tokens
 * POST /api/auth/refresh
 */
POST   /api/auth/refresh        
Body: { refresh_token: string }
Response: { access_token: string, expires_in: number }

/**
 * Get authenticated user profile
 * GET /api/auth/profile (Protected)
 */
GET    /api/auth/profile        
Headers: { Authorization: "Bearer <jwt_token>" }
Response: { userId: string, address: string, message: string }

/**
 * Logout user (client-side token invalidation)
 * POST /api/auth/logout (Protected)
 */
POST   /api/auth/logout         
Response: { message: string, timestamp: string }
```

#### **🏦 Vault Management Endpoints** (60% Complete)
```typescript
/**
 * List vaults with advanced filtering and pagination
 * GET /api/vaults
 */
GET    /api/vaults              
Query Parameters:
  - search?: string              // Search vault name, protocol, token symbol
  - riskLevel?: 'low'|'medium'|'high'
  - category?: 'stable'|'yield'|'growth'
  - minAPY?: number              // Minimum APY percentage
  - maxAPY?: number              // Maximum APY percentage  
  - protocol?: string            // Filter by protocol name
  - active?: boolean             // Show only active vaults (default: true)
  - page?: number                // Page number (default: 1)
  - limit?: number               // Items per page (default: 20, max: 100)
  - sortBy?: string              // Sort field: 'apy'|'tvl'|'name'|'createdAt'
  - sortOrder?: 'asc'|'desc'     // Sort order (default: 'desc')

Response: {
  vaults: VaultDto[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}

/**
 * Get vault details by ID
 * GET /api/vaults/:id
 */
GET    /api/vaults/:id          
Parameters: { id: string }       // CUID format vault ID
Response: VaultDto

/**
 * Get vault performance history
 * GET /api/vaults/:id/performance
 */
GET    /api/vaults/:id/performance
Response: {
  vaultId: string,
  currentAPY: number,
  historicalAPY: { date: string, apy: number }[],
  tvlHistory: { date: string, tvl: string }[],
  lastUpdated: string
}

/**
 * Get vault by contract address
 * GET /api/vaults/address/:address
 */
GET    /api/vaults/address/:address
Parameters: { address: string }  // Ethereum contract address
Response: VaultDto
```

### **Planned API Endpoints** (Not Yet Implemented)

#### **⚙️ Rules Engine API** (0% Implemented)
```typescript
// 🚧 TODO: Complete implementation required

/**
 * Get user's automation rules
 * GET /api/rules (Protected)
 */
GET    /api/rules              
Response: RuleDto[]

/**
 * Create new automation rule
 * POST /api/rules (Protected)
 */
POST   /api/rules              
Body: CreateRuleDto
Response: RuleDto

/**
 * Get rule details
 * GET /api/rules/:id (Protected)
 */
GET    /api/rules/:id          
Response: RuleDto

/**
 * Update automation rule
 * PUT /api/rules/:id (Protected)
 */
PUT    /api/rules/:id          
Body: UpdateRuleDto
Response: RuleDto

/**
 * Delete automation rule
 * DELETE /api/rules/:id (Protected)
 */
DELETE /api/rules/:id          
Response: { message: string }

/**
 * Execute rule manually
 * POST /api/rules/:id/execute (Protected)
 */
POST   /api/rules/:id/execute  
Response: ExecutionResultDto

/**
 * Enable/disable rule
 * PUT /api/rules/:id/toggle (Protected)
 */
PUT    /api/rules/:id/toggle   
Body: { active: boolean }
Response: RuleDto
```

#### **📊 Portfolio Management API** (0% Implemented)
```typescript
// 🚧 TODO: Complete implementation required

/**
 * Get user portfolio overview
 * GET /api/portfolio (Protected)
 */
GET    /api/portfolio          
Response: PortfolioOverviewDto

/**
 * Get current positions
 * GET /api/portfolio/positions (Protected)
 */
GET    /api/portfolio/positions
Response: PositionDto[]

/**
 * Get transaction history
 * GET /api/portfolio/transactions (Protected)
 */
GET    /api/portfolio/transactions
Query Parameters:
  - type?: string                // Filter by transaction type
  - startDate?: string          // ISO date string
  - endDate?: string            // ISO date string
  - limit?: number              // Items per page
  - offset?: number             // Pagination offset
Response: {
  transactions: TransactionDto[],
  total: number,
  hasMore: boolean
}

/**
 * Export portfolio data for tax purposes
 * GET /api/portfolio/export (Protected)
 */
GET    /api/portfolio/export   
Query Parameters:
  - format?: 'csv'|'json'|'pdf' // Export format
  - year?: number               // Tax year
Response: Downloadable file
```

#### **📈 Analytics API** (0% Implemented)
```typescript
// 🚧 TODO: Complete implementation required

/**
 * Get platform-wide analytics
 * GET /api/analytics/platform
 */
GET    /api/analytics/platform 
Response: PlatformAnalyticsDto

/**
 * Get total value locked metrics
 * GET /api/analytics/tvl
 */
GET    /api/analytics/tvl      
Query Parameters:
  - timeframe?: '24h'|'7d'|'30d'|'1y'
Response: TvlMetricsDto

/**
 * Get user-specific analytics (Protected)
 * GET /api/analytics/user
 */
GET    /api/analytics/user     
Response: UserAnalyticsDto
```

### **System & Monitoring Endpoints** (100% Complete)
```typescript
/**
 * Comprehensive system health check
 * GET /health
 */
GET    /health                 
Response: {
  status: 'ok'|'error',
  info: {
    database: { status: 'up'|'down' },
    redis: { status: 'up'|'down' },
    blockchain: { status: 'up'|'down', network: object, blockNumber: number }
  },
  error: object,
  details: object
}

/**
 * Application statistics
 * GET /stats
 */
GET    /stats                  
Response: {
  uptime: number,
  timestamp: string,
  environment: string,
  version: string,
  memory: object,
  cpu: object
}

/**
 * Prometheus metrics (Production monitoring)
 * GET /metrics
 */
GET    /metrics                
Response: Prometheus metrics format (text/plain)
```

---

## 🧪 **Testing Infrastructure**

### **Testing Framework** (100% Complete)

#### **Jest Configuration**
```javascript
// jest.config.js - Comprehensive testing setup
module.exports = {
  // TypeScript support
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Coverage requirements
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Test patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/test/**/*.ts',
  ],
  
  // Module path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
}
```

#### **Test Utilities** (Complete)
```typescript
// test/helpers/test-utils.ts
export class TestUtils {
  // Database test utilities
  static async cleanDatabase(prisma: PrismaService) {
    // Clean all tables in correct order to maintain referential integrity
    await prisma.ruleExecution.deleteMany()
    await prisma.distribution.deleteMany() 
    await prisma.rule.deleteMany()
    await prisma.portfolio.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.vaultPerformance.deleteMany()
    await prisma.vault.deleteMany()
    await prisma.user.deleteMany()
    await prisma.platformAnalytics.deleteMany()
  }

  // Mock data factories
  static createMockUser(): Partial<User> {
    return {
      id: 'cuid_test_user',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  static createMockVault(): Partial<Vault> {
    return {
      id: 'cuid_test_vault',
      name: 'Test Aave USDC Vault',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      protocol: 'aave',
      tokenAddress: '0xa0b86a33e6428218005c62b3e09f44d23dba6333',
      tokenSymbol: 'USDC',
      apy: 5.25,
      riskLevel: 'low',
      category: 'stable',
      tvl: new Decimal('1000000.50'),
      active: true,
      insuranceAvailable: true,
      autoCompounding: true,
      withdrawalTerms: 'instant',
    }
  }

  // JWT test utilities
  static createTestJwtToken(payload: object): string {
    return jwt.sign(payload, 'test-secret', { expiresIn: '1h' })
  }

  // HTTP test utilities
  static async makeAuthenticatedRequest(
    app: INestApplication,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    userPayload: object,
    body?: object
  ) {
    const token = this.createTestJwtToken(userPayload)
    const request = supertest(app.getHttpServer())[method.toLowerCase()](url)
      .set('Authorization', `Bearer ${token}`)
    
    if (body) {
      request.send(body)
    }
    
    return request
  }
}
```

### **Current Test Coverage**

#### **Unit Tests** (Implemented Components)
```typescript
// src/auth/auth.service.spec.ts (90% Coverage)
describe('AuthService', () => {
  // JWT token generation and validation
  // Web3 signature verification
  // User registration and login flow
  // Error handling for invalid signatures
  // Nonce generation and validation
})

// src/vaults/vaults.service.spec.ts (85% Coverage)
describe('VaultsService', () => {
  // Vault filtering and pagination
  // Search functionality across multiple fields
  // Sorting by different criteria
  // Error handling for invalid vault IDs
  // Performance data retrieval
})

// src/common/filters/global-exception.filter.spec.ts (95% Coverage)
describe('GlobalExceptionFilter', () => {
  // Prisma error handling and transformation
  // HTTP exception handling
  // Development vs production error details
  // Error logging and monitoring
})
```

#### **E2E Tests** (Core Application)
```typescript
// test/app.e2e-spec.ts (70% Coverage)
describe('Application E2E', () => {
  // Health check endpoints
  // Authentication flow end-to-end
  // Vault API integration
  // Error handling across modules
  // Rate limiting functionality
  // CORS configuration
})
```

### **Testing Scripts**
```bash
# Unit testing
npm run test                  # Run all unit tests
npm run test:watch            # Watch mode for development
npm run test:debug            # Debug mode with breakpoints

# Coverage reporting
npm run test:cov              # Generate coverage report
npm run test:cov:open         # Open coverage report in browser

# E2E testing
npm run test:e2e              # End-to-end tests
npm run test:e2e:watch        # E2E watch mode

# CI/CD testing
npm run test:ci               # Full test suite for CI/CD
npm run test:unit             # Unit tests only
npm run test:integration      # Integration tests only

# Quality checks
npm run precommit             # Pre-commit test suite
npm run test:types            # TypeScript type checking
```

### **Testing TODO List**

#### **Missing Test Coverage**
- **Rules Engine**: 0% - All endpoints and business logic need tests
- **Portfolio Management**: 0% - P&L calculations and position tracking
- **Analytics**: 0% - Data aggregation and metrics calculations
- **Blockchain Integration**: 0% - Smart contract interactions and error handling

#### **Test Implementation Priority**
1. **High Priority**: Rules engine service tests (core business logic)
2. **Medium Priority**: Portfolio calculation tests (financial accuracy)
3. **Low Priority**: Analytics aggregation tests (reporting features)

---

## 🔄 **Development Workflow**

### **Development Scripts** (Production Ready)

#### **Server Management**
```bash
# 🚀 Development server management
npm run start                 # Production mode server
npm run start:dev             # Development with hot reload
npm run start:debug           # Debug mode with inspector
npm run build                 # Production build compilation

# 🔧 Advanced server operations
npm run server:start          # Safe start with conflict prevention
npm run server:stop           # Clean server shutdown
npm run server:restart        # Safe restart with cleanup
npm run server:status         # Check server status and ports
```

#### **Database Operations**
```bash
# 🗄️ Prisma database management
npx prisma generate           # Generate Prisma client types
npx prisma db push            # Push schema changes to database
npx prisma migrate dev        # Create and apply new migration
npx prisma migrate reset      # Reset database to clean state
npx prisma studio             # Open visual database browser
npx prisma db seed            # Populate database with test data

# 📊 Database utilities
npm run db:migrate            # Apply pending migrations
npm run db:reset              # Complete database reset
npm run db:seed               # Seed development data
```

#### **Code Quality & Testing**
```bash
# 🧪 Testing commands
npm run test                  # All unit tests
npm run test:watch            # Watch mode for development
npm run test:cov              # Coverage report generation
npm run test:e2e              # End-to-end tests
npm run test:ci               # CI/CD pipeline tests

# 🔍 Code quality
npm run lint                  # ESLint validation
npm run lint:fix              # Auto-fix linting issues
npm run format                # Prettier code formatting
npm run type-check            # TypeScript compilation check
npm run precommit             # Pre-commit quality gates
```

### **Git Workflow & Branching Strategy**

#### **Branch Naming Convention**
```bash
# Feature development
feature/rules-engine-api      # New feature implementation
feature/portfolio-tracking    # Major feature addition

# Bug fixes
fix/vault-filtering-bug       # Specific bug fixes
fix/auth-token-validation     # Security fixes

# Improvements
improve/database-performance  # Performance enhancements
improve/error-handling        # Code quality improvements

# Documentation
docs/api-documentation        # Documentation updates
docs/deployment-guide         # Developer guides
```

#### **Commit Message Convention**
```bash
# Conventional commit format
type(scope): description

# Examples
feat(rules): implement rule creation endpoint
fix(auth): resolve JWT token validation issue
docs(api): update swagger documentation
test(vaults): add comprehensive vault service tests
refactor(common): improve error handling structure
perf(database): optimize vault query performance
```

#### **Development Process**
```bash
# 1. Start feature development
git checkout main
git pull origin main
git checkout -b feature/amazing-new-feature

# 2. Development with testing
npm run start:dev                    # Start development server
npm run test:watch                   # Run tests in watch mode

# 3. Make changes with commits
git add .
git commit -m "feat(feature): implement core functionality"

# 4. Pre-commit quality checks
npm run precommit                    # Run all quality checks
npm run test:e2e                     # End-to-end validation

# 5. Push and create pull request
git push origin feature/amazing-new-feature
# Create PR through GitHub interface

# 6. After review and approval
git checkout main
git pull origin main
git branch -d feature/amazing-new-feature
```

### **Code Standards & Guidelines**

#### **TypeScript Standards**
```typescript
// ✅ Strict TypeScript compliance
- Zero `any` types allowed
- Comprehensive interface definitions
- Proper generic type usage
- Strict null checks enabled
- No unused variables or imports

// ✅ Example of proper typing
interface CreateVaultDto {
  name: string;
  protocol: VaultProtocol;
  tokenAddress: string;
  riskLevel: RiskLevel;
  category: VaultCategory;
}

// ❌ Avoid - loose typing
interface BadDto {
  data: any;
  config?: any;
}
```

#### **NestJS Best Practices**
```typescript
// ✅ Proper module organization
@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [VaultsController],
  providers: [VaultsService],
  exports: [VaultsService],
})
export class VaultsModule {}

// ✅ Dependency injection with proper typing
@Injectable()
export class VaultsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}
}

// ✅ Comprehensive API documentation
@ApiOperation({ 
  summary: 'Create new automation rule',
  description: 'Creates a new profit distribution rule with validation'
})
@ApiSuccessResponse(RuleDto, 'Rule created successfully')
@ApiErrorResponse(400, 'Invalid rule configuration')
```

#### **Database Best Practices**
```typescript
// ✅ Efficient database queries
async findVaults(filters: VaultFilterDto): Promise<VaultListResponseDto> {
  // Use proper pagination and filtering
  const [vaults, total] = await Promise.all([
    this.prisma.vault.findMany({
      where: this.buildWhereClause(filters),
      orderBy: this.buildOrderBy(filters.sortBy, filters.sortOrder),
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        performance: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Only latest performance data
        },
      },
    }),
    this.prisma.vault.count({ where: this.buildWhereClause(filters) }),
  ])

  return {
    vaults: vaults.map(vault => this.transformToDto(vault)),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

// ❌ Avoid - inefficient queries
async badExample() {
  const allVaults = await this.prisma.vault.findMany() // Loads everything
  return allVaults.filter(vault => vault.active) // Filters in application
}
```

---

## 🔗 **Blockchain Integration**

### **Current Web3 Setup** (10% Complete)

#### **Basic Configuration**
```typescript
// src/blockchain/blockchain.service.ts
@Injectable()
export class BlockchainService {
  private provider: JsonRpcProvider;
  private wallet: Wallet;

  constructor(private configService: ConfigService) {
    // ✅ Basic provider setup implemented
    this.provider = new JsonRpcProvider(
      this.configService.get('ARBITRUM_RPC_URL')
    );
    
    // ✅ Wallet configuration for automation
    this.wallet = new Wallet(
      this.configService.get('PRIVATE_KEY'),
      this.provider
    );
  }

  // ⚠️ Basic methods defined but not fully implemented
  async getVaultBalance(vaultAddress: string): Promise<BigNumber> {
    // TODO: Implement vault contract interaction
    throw new Error('Not implemented');
  }

  async distributeProfits(distributions: Distribution[]): Promise<Transaction[]> {
    // TODO: Implement profit distribution logic
    throw new Error('Not implemented');
  }
}
```

### **Planned Blockchain Features** (0% Implemented)

#### **Smart Contract Integration**
```typescript
// 🚧 TODO: Complete smart contract interfaces

interface VaultContract {
  // Core vault operations
  totalAssets(): Promise<BigNumber>;
  deposit(amount: BigNumber): Promise<TransactionResponse>;
  withdraw(amount: BigNumber): Promise<TransactionResponse>;
  balanceOf(account: string): Promise<BigNumber>;
  
  // Profit tracking
  getProfits(): Promise<BigNumber>;
  getLastProfitDistribution(): Promise<BigNumber>;
  
  // Automation integration
  checkProfitThreshold(threshold: BigNumber): Promise<boolean>;
  distributeProfits(recipients: string[], amounts: BigNumber[]): Promise<TransactionResponse>;
}

interface ChainlinkAutomation {
  // Automation registration
  registerUpkeep(params: UpkeepParams): Promise<string>;
  cancelUpkeep(upkeepId: string): Promise<TransactionResponse>;
  
  // Automation execution
  checkUpkeep(checkData: string): Promise<[boolean, string]>;
  performUpkeep(performData: string): Promise<TransactionResponse>;
  
  // Automation management
  addFunds(upkeepId: string, amount: BigNumber): Promise<TransactionResponse>;
  getUpkeepInfo(upkeepId: string): Promise<UpkeepInfo>;
}
```

#### **Transaction Management**
```typescript
// 🚧 TODO: Implement transaction monitoring

class TransactionManager {
  // Transaction lifecycle management
  async submitTransaction(transaction: TransactionRequest): Promise<string>;
  async waitForConfirmation(txHash: string, confirmations: number = 3): Promise<TransactionReceipt>;
  async getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  
  // Gas optimization
  async estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
  async getOptimalGasPrice(): Promise<BigNumber>;
  async calculateTransactionCost(transaction: TransactionRequest): Promise<BigNumber>;
  
  // Error handling
  async retryTransaction(txHash: string, newGasPrice?: BigNumber): Promise<string>;
  async cancelTransaction(txHash: string): Promise<string>;
}
```

#### **Multi-chain Support Planning**
```typescript
// 🚧 TODO: Prepare for multi-chain expansion

enum SupportedChains {
  ARBITRUM_MAINNET = 42161,
  ARBITRUM_SEPOLIA = 421614,
  ETHEREUM_MAINNET = 1,
  ETHEREUM_SEPOLIA = 11155111,
}

interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    automationRegistry: string;
    multicall: string;
  };
}
```

---

## 🔄 **Background Jobs & Automation**

### **Bull Queue Infrastructure** (Configured, 0% Implemented)

#### **Queue Setup**
```typescript
// src/queue/queue.module.ts - Infrastructure ready
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Queue registration
    BullModule.registerQueue(
      { name: 'rule-execution' },
      { name: 'vault-monitoring' },
      { name: 'transaction-processing' },
      { name: 'analytics-calculation' },
    ),
  ],
  providers: [
    RuleExecutionProcessor,
    VaultMonitoringProcessor,
    TransactionProcessor,
    AnalyticsProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

### **Planned Job Processors** (0% Implemented)

#### **Rule Execution Processor**
```typescript
// 🚧 TODO: Implement rule execution jobs

@Processor('rule-execution')
export class RuleExecutionProcessor {
  constructor(
    private rulesService: RulesService,
    private blockchainService: BlockchainService,
    private logger: Logger,
  ) {}

  @Process('execute-rule')
  async executeRule(job: Job<{ ruleId: string }>): Promise<ExecutionResult> {
    const { ruleId } = job.data;
    this.logger.log(`Starting execution for rule ${ruleId}`);

    try {
      // 1. Validate rule conditions
      const rule = await this.rulesService.validateRule(ruleId);
      
      // 2. Check profit threshold
      const canExecute = await this.rulesService.checkExecutionConditions(rule);
      if (!canExecute) {
        return { success: false, reason: 'Conditions not met' };
      }

      // 3. Execute profit distribution
      const result = await this.blockchainService.executeProfitDistribution(rule);
      
      // 4. Record execution
      await this.rulesService.recordExecution(ruleId, result);
      
      this.logger.log(`Rule ${ruleId} executed successfully`);
      return { success: true, result };
      
    } catch (error) {
      this.logger.error(`Rule execution failed for ${ruleId}`, error);
      await this.rulesService.recordFailedExecution(ruleId, error.message);
      throw error;
    }
  }

  @Process('schedule-rule')
  async scheduleRule(job: Job<{ ruleId: string }>): Promise<void> {
    // Schedule next execution based on rule trigger
    const rule = await this.rulesService.findById(job.data.ruleId);
    const nextExecution = this.calculateNextExecution(rule);
    
    await this.rulesService.updateNextExecution(rule.id, nextExecution);
  }
}
```

#### **Vault Monitoring Processor**
```typescript
// 🚧 TODO: Implement vault monitoring jobs

@Processor('vault-monitoring')
export class VaultMonitoringProcessor {
  @Process('update-vault-data')
  async updateVaultData(job: Job<{ vaultId: string }>): Promise<void> {
    const { vaultId } = job.data;
    
    // Fetch current vault data from blockchain
    const vaultData = await this.blockchainService.getVaultData(vaultId);
    
    // Update database with latest information
    await this.vaultsService.updateVaultData(vaultId, vaultData);
    
    // Record performance history
    await this.vaultsService.recordPerformanceSnapshot(vaultId, vaultData);
  }

  @Process('monitor-all-vaults')
  async monitorAllVaults(): Promise<void> {
    const activeVaults = await this.vaultsService.getActiveVaults();
    
    // Queue individual vault updates
    for (const vault of activeVaults) {
      await this.vaultQueue.add('update-vault-data', { vaultId: vault.id });
    }
  }
}
```

#### **Scheduled Tasks**
```typescript
// 🚧 TODO: Implement cron job scheduling

@Injectable()
export class SchedulerService {
  constructor(
    private ruleQueue: Queue,
    private vaultQueue: Queue,
    private analyticsQueue: Queue,
  ) {}

  // Check for rules ready to execute (every 5 minutes)
  @Cron('0 */5 * * * *')
  async checkPendingRules(): Promise<void> {
    const pendingRules = await this.rulesService.getPendingRules();
    
    for (const rule of pendingRules) {
      await this.ruleQueue.add('execute-rule', { ruleId: rule.id });
    }
  }

  // Update vault data (every 15 minutes)
  @Cron('0 */15 * * * *')
  async updateVaultData(): Promise<void> {
    await this.vaultQueue.add('monitor-all-vaults', {});
  }

  // Calculate daily analytics (at midnight)
  @Cron('0 0 0 * * *')
  async calculateDailyAnalytics(): Promise<void> {
    await this.analyticsQueue.add('calculate-daily-metrics', {
      date: new Date().toISOString().split('T')[0],
    });
  }

  // Health check for automation system (every minute)
  @Cron('0 * * * * *')
  async healthCheck(): Promise<void> {
    // Monitor queue health and system performance
    const queueHealth = await this.checkQueueHealth();
    if (!queueHealth.healthy) {
      this.logger.error('Queue system unhealthy', queueHealth.details);
      // Send alerts or take corrective action
    }
  }
}
```

---

## 📊 **Monitoring & Observability**

### **Health Check System** (100% Complete)

#### **Comprehensive Health Monitoring**
```typescript
// src/common/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
    private blockchain: BlockchainHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database connectivity
      () => this.database.isHealthy('database'),
      
      // Redis connectivity
      () => this.redis.isHealthy('redis'),
      
      // Blockchain RPC connectivity
      () => this.blockchain.isHealthy('blockchain'),
      
      // Memory usage check
      () => this.checkMemoryUsage(),
      
      // Queue system health
      () => this.checkQueueHealth(),
    ]);
  }

  @Get('detailed')
  async detailedCheck(): Promise<DetailedHealthCheck> {
    // More comprehensive health check with performance metrics
    return {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database: await this.getDatabaseMetrics(),
        redis: await this.getRedisMetrics(),
        blockchain: await this.getBlockchainMetrics(),
        application: await this.getApplicationMetrics(),
      },
    };
  }
}
```

#### **Custom Health Indicators**
```typescript
// src/common/health/indicators/blockchain-health.indicator.ts
@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  constructor(private configService: ConfigService) {
    super();
    this.provider = new JsonRpcProvider(
      this.configService.get('ARBITRUM_RPC_URL')
    );
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test blockchain connectivity
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const blockTime = Date.now() - (await this.provider.getBlock(blockNumber)).timestamp * 1000;

      // Check if blockchain is synced (block time within 5 minutes)
      const isSynced = blockTime < 5 * 60 * 1000;

      return this.getStatus(key, isSynced, {
        status: isSynced ? 'up' : 'behind',
        network: {
          name: network.name,
          chainId: Number(network.chainId),
        },
        blockNumber,
        blockTimestamp: blockTime,
        rpcUrl: this.configService.get('ARBITRUM_RPC_URL'),
      });

    } catch (error) {
      throw new HealthCheckError(
        'Blockchain health check failed',
        this.getStatus(key, false, {
          status: 'down',
          error: error.message,
        }),
      );
    }
  }
}
```

### **Logging System** (100% Complete)

#### **Winston Logger Configuration**
```typescript
// src/common/logger/logger.module.ts
@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const logLevel = configService.get('LOG_LEVEL', 'info');
        const nodeEnv = configService.get('NODE_ENV', 'development');

        return {
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
          transports: [
            // Console logging
            new winston.transports.Console({
              format: nodeEnv === 'development' 
                ? winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                  )
                : winston.format.json(),
            }),
            
            // File logging for production
            ...(nodeEnv === 'production' ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
              }),
            ] : []),
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
```

#### **Structured Logging**
```typescript
// src/common/logger/logger.service.ts
@Injectable()
export class CustomLoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger) {}

  // Business event logging
  logUserAction(userId: string, action: string, metadata?: object): void {
    this.logger.info('User action performed', {
      userId,
      action,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  logRuleExecution(ruleId: string, result: ExecutionResult): void {
    this.logger.info('Rule executed', {
      ruleId,
      success: result.success,
      profitAmount: result.profitAmount,
      gasUsed: result.gasUsed,
      executionTime: result.executionTime,
      timestamp: new Date().toISOString(),
    });
  }

  logBlockchainTransaction(txHash: string, operation: string, metadata?: object): void {
    this.logger.info('Blockchain transaction', {
      transactionHash: txHash,
      operation,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  // Performance logging
  logDatabaseQuery(query: string, duration: number, rowCount?: number): void {
    this.logger.debug('Database query executed', {
      query: query.substring(0, 100), // Truncate long queries
      duration,
      rowCount,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### **Metrics Collection** (100% Complete)

#### **Prometheus Integration**
```typescript
// src/common/metrics/metrics.service.ts
@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    
    @InjectMetric('database_queries_total')
    private readonly databaseQueriesTotal: Counter<string>,
    
    @InjectMetric('blockchain_transactions_total')
    private readonly blockchainTransactionsTotal: Counter<string>,
    
    @InjectMetric('active_users')
    private readonly activeUsers: Gauge<string>,
    
    @InjectMetric('vault_tvl_total')
    private readonly vaultTvlTotal: Gauge<string>,
  ) {}

  // HTTP metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, route).observe(duration / 1000); // Convert to seconds
  }

  // Business metrics
  recordRuleExecution(success: boolean, executionTime: number): void {
    this.ruleExecutionsTotal.labels(success ? 'success' : 'failure').inc();
    this.ruleExecutionDuration.observe(executionTime / 1000);
  }

  updateVaultTvl(vaultId: string, protocol: string, tvl: number): void {
    this.vaultTvlTotal.labels(vaultId, protocol).set(tvl);
  }

  updateActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }
}
```

#### **Metrics Endpoint**
```typescript
// src/common/metrics/metrics.controller.ts
@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiExcludeEndpoint() // Hide from Swagger docs
  async index(@Res() response: Response): Promise<string> {
    return super.index(response);
  }
}
```

---

## 🚀 **Production Deployment**

### **Docker Configuration** (Production Ready)

#### **Multi-stage Dockerfile**
```dockerfile
# Dockerfile - Optimized for production
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs && chown nestjs:nodejs logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
```

#### **Docker Compose for Development**
```yaml
# docker-compose.yml - Complete development environment
version: '3.8'

services:
  # Backend application
  backend:
    build:
      context: .
      target: production
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/valux_dev
      - REDIS_URL=redis://redis:6379
      - ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
      - JWT_SECRET=development-jwt-secret-key
      - SESSION_SECRET=development-session-secret
      - LOG_LEVEL=debug
      - ENABLE_SWAGGER=true
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - valux-network
    restart: unless-stopped

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=valux_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - valux-network
    restart: unless-stopped

  # Redis cache and queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - valux-network
    restart: unless-stopped

  # Database administration
  adminer:
    image: adminer:latest
    ports:
      - "8081:8080"
    environment:
      - ADMINER_DEFAULT_SERVER=db
    depends_on:
      - db
    networks:
      - valux-network

  # Redis administration
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports:
      - "8082:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379
    depends_on:
      - redis
    networks:
      - valux-network

volumes:
  postgres_data:
  redis_data:

networks:
  valux-network:
    driver: bridge
```

#### **Production Docker Compose**
```yaml
# docker-compose.prod.yml - Production deployment
version: '3.8'

services:
  backend:
    build:
      context: .
      target: production
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ARBITRUM_RPC_URL=${ARBITRUM_RPC_URL}
      - PRIVATE_KEY=${PRIVATE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - LOG_LEVEL=info
      - ENABLE_SWAGGER=false
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
      - /etc/ssl/certs:/etc/ssl/certs:ro
    networks:
      - valux-production
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '1'
        reservations:
          memory: 256M
          cpus: '0.5'

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
    networks:
      - valux-production
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2'

  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod:/data
    networks:
      - valux-production
    restart: always
    command: redis-server --save 60 1 --loglevel warning

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/private
    depends_on:
      - backend
    networks:
      - valux-production
    restart: always

volumes:
  postgres_prod:
  redis_prod:

networks:
  valux-production:
    driver: bridge
```

### **Environment-Specific Deployment**

#### **Development Deployment**
```bash
# Local development setup
npm install
cp .env.example .env
npx prisma db push
npm run start:dev

# Docker development
docker-compose up -d
docker-compose logs -f backend
```

#### **Staging Deployment**
```bash
# Staging environment
export NODE_ENV=staging
export DATABASE_URL="postgresql://staging_user:password@staging-db:5432/valux_staging"
export REDIS_URL="redis://staging-redis:6379"

npm run build
npm run start:prod
```

#### **Production Deployment**
```bash
# Production deployment with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.prod.yml valux-production

# Monitor deployment
docker service ls
docker service logs valux-production_backend
```

### **CI/CD Pipeline Configuration**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: valux_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma client
        run: npx prisma generate
      
      - name: Run database migrations
        run: npx prisma db push
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/valux_test
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/valux_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          SESSION_SECRET: test-session-secret
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/valux_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          SESSION_SECRET: test-session-secret
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t valux-backend:latest .
      
      - name: Save Docker image
        run: docker save valux-backend:latest | gzip > valux-backend.tar.gz
      
      - name: Upload Docker image artifact
        uses: actions/upload-artifact@v4
        with:
          name: docker-image
          path: valux-backend.tar.gz

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Add your deployment scripts here
```

### **Production Security Configuration**

#### **Environment Variables Security**
```bash
# Production secrets management
# Use AWS Secrets Manager, Azure Key Vault, or similar

# Database credentials
export DATABASE_URL="$(aws secretsmanager get-secret-value --secret-id prod/valux/database --query SecretString --output text)"

# JWT secrets
export JWT_SECRET="$(aws secretsmanager get-secret-value --secret-id prod/valux/jwt-secret --query SecretString --output text)"

# Blockchain private key
export PRIVATE_KEY="$(aws secretsmanager get-secret-value --secret-id prod/valux/automation-key --query SecretString --output text)"
```

#### **Nginx Configuration**
```nginx
# nginx.conf - Production reverse proxy
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name api.valux.finance;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.valux.finance;

        # SSL configuration
        ssl_certificate /etc/ssl/private/valux.crt;
        ssl_certificate_key /etc/ssl/private/valux.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check (no rate limiting)
        location /health {
            proxy_pass http://backend;
        }

        # Metrics (restricted access)
        location /metrics {
            allow 10.0.0.0/8;
            allow 172.16.0.0/12;
            allow 192.168.0.0/16;
            deny all;
            proxy_pass http://backend;
        }
    }
}
```

---

## 🎯 **Implementation Roadmap**

### **Phase 1: Core API Completion** (Weeks 1-4)

#### **Week 1-2: Rules Engine Implementation**
```typescript
// Priority 1: Rules management endpoints
- POST /api/rules              # Create rule
- GET /api/rules               # List user rules  
- PUT /api/rules/:id           # Update rule
- DELETE /api/rules/:id        # Delete rule

// Required services
- RulesService.create()
- RulesService.update()
- RulesService.delete()
- RulesService.findByUser()

// Validation requirements
- Rule configuration validation
- Distribution percentage validation (must sum to 100%)
- Wallet address validation
- Trigger condition validation
```

#### **Week 2-3: Portfolio Management API**
```typescript
// Priority 2: Portfolio tracking endpoints
- GET /api/portfolio           # Portfolio overview
- GET /api/portfolio/positions # Current positions
- GET /api/transactions        # Transaction history
- GET /api/portfolio/export    # Tax export

// Required services  
- PortfolioService.getOverview()
- PortfolioService.getPositions()
- PortfolioService.calculatePnL()
- TransactionService.getHistory()

// Business logic requirements
- Real-time P&L calculations
- Position tracking across multiple vaults
- Transaction categorization and filtering
- Export functionality (CSV, JSON, PDF)
```

#### **Week 3-4: Basic Blockchain Integration**
```typescript
// Priority 3: Smart contract interactions
- Vault balance checking
- Transaction status monitoring
- Basic profit distribution
- Gas fee estimation

// Required implementations
- Contract ABI integration
- Transaction submission and tracking
- Error handling for blockchain operations
- Retry logic for failed transactions
```

### **Phase 2: Advanced Features** (Weeks 5-8)

#### **Week 5-6: Background Job Processing**
```typescript
// Bull Queue implementation
- Rule execution processor
- Vault monitoring jobs
- Transaction confirmation tracking
- Analytics calculation jobs

// Scheduler implementation
- Cron job setup for rule checking
- Automated vault data updates
- Health monitoring jobs
```

#### **Week 6-7: Real-time Features**
```typescript
// WebSocket implementation
- Real-time vault APY updates
- Portfolio balance notifications
- Rule execution status updates
- Transaction confirmation alerts

// Event-driven architecture
- Blockchain event listening
- Database change streams
- Client notification system
```

#### **Week 7-8: Analytics Dashboard**
```typescript
// Analytics API implementation
- Platform metrics calculation
- User analytics aggregation
- TVL tracking and reporting
- Performance benchmarking

// Data visualization support
- Time-series data endpoints
- Aggregated metrics APIs
- Historical data analysis
```

### **Phase 3: Production Optimization** (Weeks 9-12)

#### **Week 9-10: Performance & Caching**
```typescript
// Redis caching implementation
- API response caching
- Database query result caching
- Session management optimization
- Background job result caching

// Database optimization
- Query performance analysis
- Index optimization
- Connection pool tuning
- Slow query monitoring
```

#### **Week 10-11: Chainlink Automation**
```typescript
// Production automation system
- Chainlink upkeep registration
- Automated rule execution
- Gas fee optimization
- Automation monitoring and alerting

// Reliability improvements
- Failover mechanisms
- Error recovery procedures
- Execution retry logic
- Performance monitoring
```

#### **Week 11-12: Security & Monitoring**
```typescript
// Security enhancements
- API rate limiting refinement
- Input validation strengthening
- Security headers optimization
- Audit trail implementation

// Advanced monitoring
- Custom metrics collection
- Alert system setup
- Performance benchmarking
- Capacity planning analysis
```

### **Phase 4: Enterprise Features** (Month 4+)

#### **Advanced Architecture**
- Microservices decomposition
- Service mesh implementation
- Advanced load balancing
- Multi-region deployment

#### **Enhanced Analytics**
- Machine learning insights
- Predictive analytics
- Advanced reporting
- Business intelligence dashboard

#### **Mobile & Integration Support**
- Mobile-optimized APIs
- Third-party integrations
- Webhook systems
- API versioning strategy

---

## 🤝 **Contributing Guidelines**

### **Development Standards** (Enforced)

#### **Code Quality Requirements**
- **TypeScript Strict**: 100% compliance, zero `any` types allowed
- **Test Coverage**: 80%+ for all new features, comprehensive test suites
- **Documentation**: Swagger docs required for all endpoints
- **Code Review**: All changes require approval from code owners
- **Conventional Commits**: Standardized commit message format enforced

#### **Pull Request Process**
```bash
# 1. Feature branch creation
git checkout main
git pull origin main
git checkout -b feature/descriptive-feature-name

# 2. Development with quality checks
npm run start:dev              # Development server
npm run test:watch             # Continuous testing
npm run lint                   # Code style validation

# 3. Pre-commit validation
npm run precommit              # Full quality check
npm run test:e2e               # End-to-end validation
npm run type-check             # TypeScript compilation

# 4. Pull request submission
git push origin feature/descriptive-feature-name
# Create PR through GitHub with detailed description

# 5. Post-merge cleanup
git checkout main
git pull origin main
git branch -d feature/descriptive-feature-name
```

#### **Code Review Checklist**
- [ ] **Functionality**: Feature works as intended
- [ ] **Tests**: Comprehensive test coverage (80%+)
- [ ] **Documentation**: API docs updated, comments added
- [ ] **Performance**: No performance regressions
- [ ] **Security**: Input validation, authentication checks
- [ ] **Database**: Migrations included if schema changes
- [ ] **Type Safety**: TypeScript strict compliance
- [ ] **Error Handling**: Proper exception handling
- [ ] **Logging**: Appropriate logging for monitoring

### **Development Environment Setup**

#### **Prerequisites Installation**
```bash
# Required software
- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- Redis 7+
- Git
- Docker & Docker Compose (optional but recommended)

# Development tools
- VS Code (recommended IDE)
- Prisma extension for VS Code
- ESLint extension
- Prettier extension
- Thunder Client or Postman (API testing)
```

#### **Project Setup**
```bash
# 1. Repository setup
git clone https://github.com/your-username/valux.finance.git
cd valux.finance/valux-backend

# 2. Environment configuration
cp .env.example .env
# Edit .env with your local database and API keys

# 3. Dependencies installation
npm install

# 4. Database setup
npx prisma generate
npx prisma db push
npx prisma db seed            # Optional: seed test data

# 5. Verification
npm run test                  # Run test suite
npm run start:dev             # Start development server
curl http://localhost:8080/health  # Verify server health
```

#### **IDE Configuration**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.env": true
  },
  "eslint.validate": [
    "typescript",
    "typescriptreact"
  ]
}
```

### **Documentation Standards**

#### **API Documentation Requirements**
```typescript
// Required for all endpoints
@ApiOperation({
  summary: 'Brief endpoint description',
  description: 'Detailed explanation of functionality, use cases, and behavior'
})
@ApiSuccessResponse(ResponseDto, 'Success response description')
@ApiErrorResponse(400, 'Bad request error description')
@ApiErrorResponse(401, 'Unauthorized error description') 
@ApiErrorResponse(404, 'Resource not found description')
@ApiErrorResponse(500, 'Internal server error description')

// Required for DTOs
export class CreateRuleDto {
  @ApiProperty({
    description: 'Rule name for identification',
    example: 'Monthly Profit Distribution',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
```

#### **Code Documentation**
```typescript
/**
 * Service responsible for managing DeFi vault operations
 * Handles CRUD operations, performance tracking, and data aggregation
 * 
 * @example
 * ```typescript
 * const vaults = await vaultsService.findAll({
 *   riskLevel: 'low',
 *   minAPY: 5,
 *   limit: 20
 * });
 * ```
 */
@Injectable()
export class VaultsService {
  /**
   * Retrieves vaults with advanced filtering and pagination
   * 
   * @param filterDto - Filtering and pagination parameters
   * @returns Paginated list of vaults with metadata
   * @throws BusinessException when validation fails
   * @throws ResourceNotFoundException when no vaults found
   */
  async findAll(filterDto: VaultFilterDto): Promise<VaultListResponseDto> {
    // Implementation...
  }
}
```

---

## 📚 **Additional Resources**

### **Related Documentation**
- **[Frontend Integration Guide](../valux-frontend/CLAUDE.md)**: Frontend compatibility and API usage
- **[Database Schema Reference](./prisma/schema.prisma)**: Complete data model documentation
- **[API Documentation](http://localhost:8080/api/docs)**: Interactive Swagger interface
- **[Production Deployment Guide](./docs/deployment.md)**: Production setup and configuration

### **External Resources**
- **[NestJS Documentation](https://docs.nestjs.com/)**: Framework reference and best practices
- **[Prisma Documentation](https://www.prisma.io/docs/)**: Database ORM and migration guides
- **[ethers.js Documentation](https://docs.ethers.io/)**: Web3 integration and smart contract interaction
- **[Arbitrum Developer Docs](https://developer.arbitrum.io/)**: Blockchain network specifics

### **Community & Support**
- **GitHub Issues**: Bug reports and feature requests
- **Development Discord**: Real-time development support and collaboration
- **Code Review Process**: Pull request feedback and mentoring
- **Architecture Discussions**: System design and scaling considerations

---

## 🎯 **Quick Reference**

### **Essential Commands**
```bash
# Development
npm run start:dev             # Hot reload development server
npm run test:watch            # Continuous testing
npm run precommit             # Quality gate before commits

# Database  
npx prisma studio             # Visual database browser
npx prisma migrate dev        # Create and apply migration
npx prisma db push            # Push schema changes

# Production
npm run build                 # Production build
npm run start:prod            # Production server
docker-compose up -d          # Full environment
```

### **Important URLs**
```bash
# Development endpoints
http://localhost:8080/health           # Health check
http://localhost:8080/api/docs         # API documentation
http://localhost:8080/metrics          # Prometheus metrics
http://localhost:5555                  # Prisma Studio (when running)
```

### **Environment Variables Quick Reference**
```bash
# Required for development
DATABASE_URL="postgresql://postgres:password@localhost:5432/valux_db"
REDIS_URL="redis://localhost:6379"  
JWT_SECRET="development-secret-key"
SESSION_SECRET="development-session-secret"

# Optional for development
NODE_ENV="development"
LOG_LEVEL="debug"
ENABLE_SWAGGER="true"
PORT="8080"
```

---

**📖 This guide serves as the complete developer handbook for the Valux.finance backend. Keep it updated as the project evolves and new features are implemented.**

**🚀 Ready to build the future of DeFi automation!**
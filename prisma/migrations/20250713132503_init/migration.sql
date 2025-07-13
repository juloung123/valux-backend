-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaults" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "apy" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tvl" DECIMAL(20,8) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "insurance_available" BOOLEAN NOT NULL DEFAULT false,
    "auto_compounding" BOOLEAN NOT NULL DEFAULT false,
    "withdrawal_terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_performance" (
    "id" TEXT NOT NULL,
    "vault_id" TEXT NOT NULL,
    "apy" DOUBLE PRECISION NOT NULL,
    "tvl" DECIMAL(20,8) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT NOT NULL,
    "vault_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "profit_threshold" DECIMAL(20,8),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_executed" TIMESTAMP(3),
    "next_execution" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'wallet',

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_executions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profit_amount" DECIMAL(20,8) NOT NULL,
    "gas_used" DECIMAL(20,8),
    "gas_fee" DECIMAL(20,8),
    "transactions" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "performance_fee" DECIMAL(20,8),

    CONSTRAINT "rule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vault_id" TEXT NOT NULL,
    "deposit_amount" DECIMAL(20,8) NOT NULL,
    "current_value" DECIMAL(20,8) NOT NULL,
    "unrealized_pnl" DECIMAL(20,8) NOT NULL,
    "realized_pnl" DECIMAL(20,8) NOT NULL,
    "total_distributed" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "avg_apy" DOUBLE PRECISION,
    "first_deposit_at" TIMESTAMP(3) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "block_number" INTEGER,
    "gas_used" DECIMAL(20,8),
    "gas_fee" DECIMAL(20,8),
    "from_address" TEXT,
    "to_address" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_analytics" (
    "id" TEXT NOT NULL,
    "analytics_date" DATE NOT NULL,
    "total_tvl" DECIMAL(20,8) NOT NULL,
    "total_users" INTEGER NOT NULL,
    "active_users_24h" INTEGER NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "transaction_volume_24h" DECIMAL(20,8) NOT NULL,
    "total_fees_generated" DECIMAL(20,8) NOT NULL,
    "fees_generated_24h" DECIMAL(20,8) NOT NULL,
    "total_rules" INTEGER NOT NULL,
    "active_rules" INTEGER NOT NULL,
    "total_distributed" DECIMAL(20,8) NOT NULL,
    "avg_apy" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "vaults_contract_address_key" ON "vaults"("contract_address");

-- CreateIndex
CREATE INDEX "vault_performance_vault_id_timestamp_idx" ON "vault_performance"("vault_id", "timestamp");

-- CreateIndex
CREATE INDEX "rules_user_id_idx" ON "rules"("user_id");

-- CreateIndex
CREATE INDEX "rules_vault_id_idx" ON "rules"("vault_id");

-- CreateIndex
CREATE INDEX "rules_next_execution_idx" ON "rules"("next_execution");

-- CreateIndex
CREATE INDEX "distributions_rule_id_idx" ON "distributions"("rule_id");

-- CreateIndex
CREATE INDEX "rule_executions_rule_id_idx" ON "rule_executions"("rule_id");

-- CreateIndex
CREATE INDEX "rule_executions_executed_at_idx" ON "rule_executions"("executed_at");

-- CreateIndex
CREATE INDEX "rule_executions_status_idx" ON "rule_executions"("status");

-- CreateIndex
CREATE INDEX "portfolios_user_id_idx" ON "portfolios"("user_id");

-- CreateIndex
CREATE INDEX "portfolios_vault_id_idx" ON "portfolios"("vault_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_user_id_vault_id_key" ON "portfolios"("user_id", "vault_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_hash_key" ON "transactions"("transaction_hash");

-- CreateIndex
CREATE INDEX "transactions_portfolio_id_idx" ON "transactions"("portfolio_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_hash_idx" ON "transactions"("transaction_hash");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_executed_at_idx" ON "transactions"("executed_at");

-- CreateIndex
CREATE UNIQUE INDEX "platform_analytics_analytics_date_key" ON "platform_analytics"("analytics_date");

-- CreateIndex
CREATE INDEX "platform_analytics_analytics_date_idx" ON "platform_analytics"("analytics_date");

-- AddForeignKey
ALTER TABLE "vault_performance" ADD CONSTRAINT "vault_performance_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_executions" ADD CONSTRAINT "rule_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vaults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

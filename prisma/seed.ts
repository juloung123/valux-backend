import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample vaults based on frontend mock data
  const vaults = [
    {
      name: 'Aave USDC Vault',
      address: '0xa0b86a33e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d5e',
      protocol: 'aave',
      tokenAddress: '0xa0b86a33e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d5e',
      tokenSymbol: 'USDC',
      apy: 3.2,
      riskLevel: 'low',
      category: 'stable',
      tvl: 125000000.50,
      insuranceAvailable: true,
      autoCompounding: true,
      withdrawalTerms: 'instant',
    },
    {
      name: 'Lido Staked ETH',
      address: '0xb1c97a44e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d5f',
      protocol: 'lido',
      tokenAddress: '0xb1c97a44e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d5f',
      tokenSymbol: 'stETH',
      apy: 4.1,
      riskLevel: 'low',
      category: 'yield',
      tvl: 89750000.75,
      insuranceAvailable: false,
      autoCompounding: true,
      withdrawalTerms: '7days',
    },
    {
      name: 'Compound ETH Vault',
      address: '0xc2d88b55e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d60',
      protocol: 'compound',
      tokenAddress: '0xc2d88b55e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d60',
      tokenSymbol: 'cETH',
      apy: 2.8,
      riskLevel: 'medium',
      category: 'yield',
      tvl: 45230000.25,
      insuranceAvailable: true,
      autoCompounding: false,
      withdrawalTerms: 'instant',
    },
    {
      name: 'Curve 3Pool Vault',
      address: '0xd3e99c66e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d61',
      protocol: 'curve',
      tokenAddress: '0xd3e99c66e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d61',
      tokenSymbol: '3CRV',
      apy: 5.7,
      riskLevel: 'medium',
      category: 'stable',
      tvl: 67890000.80,
      insuranceAvailable: false,
      autoCompounding: true,
      withdrawalTerms: 'instant',
    },
    {
      name: 'Yearn DAI Vault',
      address: '0xe4f0aa77e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d62',
      protocol: 'yearn',
      tokenAddress: '0xe4f0aa77e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d62',
      tokenSymbol: 'yvDAI',
      apy: 8.9,
      riskLevel: 'high',
      category: 'growth',
      tvl: 23450000.60,
      insuranceAvailable: false,
      autoCompounding: true,
      withdrawalTerms: 'instant',
    },
    {
      name: 'Balancer 80/20 WETH/USDC',
      address: '0xf5g1bb88e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d63',
      protocol: 'balancer',
      tokenAddress: '0xf5g1bb88e6ba0a6e5c8e5d2b7f8e1c0a2b3c4d63',
      tokenSymbol: 'BPT',
      apy: 12.5,
      riskLevel: 'high',
      category: 'growth',
      tvl: 15670000.45,
      insuranceAvailable: false,
      autoCompounding: false,
      withdrawalTerms: '30days',
    },
  ];

  console.log('📦 Creating vaults...');
  for (const vaultData of vaults) {
    const vault = await prisma.vault.upsert({
      where: { address: vaultData.address },
      update: {},
      create: vaultData,
    });
    console.log(`✅ Created vault: ${vault.name}`);
  }

  // Create a sample user
  const sampleUser = await prisma.user.upsert({
    where: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    update: {},
    create: {
      address: '0x1234567890abcdef1234567890abcdef12345678',
    },
  });
  console.log(`✅ Created sample user: ${sampleUser.address}`);

  // Create sample portfolios for the user
  const firstVault = await prisma.vault.findFirst();
  const secondVault = await prisma.vault.findFirst({
    skip: 1,
  });

  if (firstVault && secondVault) {
    const portfolios = [
      {
        userId: sampleUser.id,
        vaultId: firstVault.id,
        depositAmount: 10000.0,
        currentValue: 10320.0,
        unrealizedPnl: 320.0,
        realizedPnl: 150.0,
        totalDistributed: 150.0,
        avgAPY: 3.2,
        firstDepositAt: new Date('2024-01-15'),
      },
      {
        userId: sampleUser.id,
        vaultId: secondVault.id,
        depositAmount: 5000.0,
        currentValue: 5205.0,
        unrealizedPnl: 205.0,
        realizedPnl: 75.0,
        totalDistributed: 75.0,
        avgAPY: 4.1,
        firstDepositAt: new Date('2024-02-01'),
      },
    ];

    console.log('💼 Creating sample portfolios...');
    for (const portfolioData of portfolios) {
      const portfolio = await prisma.portfolio.upsert({
        where: {
          userId_vaultId: {
            userId: portfolioData.userId,
            vaultId: portfolioData.vaultId,
          },
        },
        update: {},
        create: portfolioData,
      });
      console.log(`✅ Created portfolio for vault: ${portfolio.vaultId}`);
    }

    // Create sample rules
    const rules = [
      {
        name: 'Monthly Savings',
        description: 'Distribute 70% to savings, 30% reinvest',
        userId: sampleUser.id,
        vaultId: firstVault.id,
        trigger: 'monthly',
        nextExecution: new Date('2025-08-01'),
      },
      {
        name: 'Weekly Family Support',
        description: 'Send weekly allowance to family',
        userId: sampleUser.id,
        vaultId: secondVault.id,
        trigger: 'weekly',
        nextExecution: new Date('2025-07-20'),
      },
    ];

    console.log('⚙️ Creating sample rules...');
    for (const ruleData of rules) {
      const rule = await prisma.rule.create({
        data: ruleData,
      });
      console.log(`✅ Created rule: ${rule.name}`);

      // Create distributions for each rule
      if (rule.name === 'Monthly Savings') {
        await prisma.distribution.createMany({
          data: [
            {
              ruleId: rule.id,
              recipient: '0x9876543210fedcba9876543210fedcba98765432',
              percentage: 70,
              description: 'Personal savings account',
              type: 'wallet',
            },
            {
              ruleId: rule.id,
              recipient: 'reinvest',
              percentage: 30,
              description: 'Compound returns',
              type: 'reinvest',
            },
          ],
        });
        console.log(`  ✅ Created distributions for: ${rule.name}`);
      } else if (rule.name === 'Weekly Family Support') {
        await prisma.distribution.create({
          data: {
            ruleId: rule.id,
            recipient: '0xabcdef1234567890abcdef1234567890abcdef12',
            percentage: 100,
            description: 'Family support wallet',
            type: 'wallet',
          },
        });
        console.log(`  ✅ Created distribution for: ${rule.name}`);
      }
    }

    // Create sample transactions
    const portfolioIds = await prisma.portfolio.findMany({
      where: { userId: sampleUser.id },
      select: { id: true },
    });

    if (portfolioIds.length > 0) {
      const transactions = [
        {
          portfolioId: portfolioIds[0].id,
          hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
          type: 'deposit',
          amount: 10000.0,
          tokenSymbol: 'USDC',
          status: 'confirmed',
          blockNumber: 12345678,
          gasUsed: 21000,
          gasFee: 0.001,
          fromAddress: sampleUser.address,
          toAddress: firstVault.address,
          confirmedAt: new Date('2024-01-15T10:30:00Z'),
        },
        {
          portfolioId: portfolioIds[0].id,
          hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          type: 'distribution',
          amount: 150.0,
          tokenSymbol: 'USDC',
          status: 'confirmed',
          blockNumber: 12456789,
          gasUsed: 35000,
          gasFee: 0.002,
          fromAddress: firstVault.address,
          toAddress: '0x9876543210fedcba9876543210fedcba98765432',
          confirmedAt: new Date('2024-06-01T14:20:00Z'),
        },
      ];

      console.log('💰 Creating sample transactions...');
      for (const txData of transactions) {
        const transaction = await prisma.transaction.create({
          data: txData,
        });
        console.log(`✅ Created transaction: ${transaction.type} - ${transaction.amount} ${transaction.tokenSymbol}`);
      }
    }
  }

  // Create initial platform analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const analytics = await prisma.platformAnalytics.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      totalTVL: 367000000.0,
      totalUsers: 1247,
      activeUsers24h: 89,
      totalTransactions: 8934,
      transactionVolume24h: 2456789.50,
      totalFeesGenerated: 12345.67,
      feesGenerated24h: 89.23,
      totalRules: 2,
      activeRules: 2,
      totalDistributed: 225.0,
      avgAPY: 6.2,
    },
  });
  console.log(`✅ Created platform analytics for: ${analytics.date.toDateString()}`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Vaults: ${vaults.length}`);
  console.log(`- Users: 1`);
  console.log(`- Portfolios: 2`);
  console.log(`- Rules: 2`);
  console.log(`- Transactions: 2`);
  console.log(`- Analytics: 1 day`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
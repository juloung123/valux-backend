const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking for wallet address: 0x15B9c4eC6Ef4113b84A9B9BF67523df7e9838e68');
    
    const user = await prisma.user.findUnique({
      where: {
        address: '0x15B9c4eC6Ef4113b84A9B9BF67523df7e9838e68'
      }
    });

    if (user) {
      console.log('✅ User found:', user);
    } else {
      console.log('❌ User not found in database');
    }

    // Also check all users to see what's in the database
    console.log('\nAll users in database:');
    const allUsers = await prisma.user.findMany();
    allUsers.forEach(user => {
      console.log(`- ${user.address} (ID: ${user.id})`);
    });

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
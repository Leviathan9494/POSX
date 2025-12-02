import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProducts() {
  console.log('Sample products with prices:\n');

  // Test common search terms
  const searchTerms = ['vape', 'battery', 'flower', 'pen', 'juice', 'coil'];

  for (const term of searchTerms) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { category: { contains: term } }
        ],
        price: { gt: 0 }
      },
      take: 3,
      select: {
        name: true,
        category: true,
        price: true,
        stock: true
      }
    });

    console.log(`\n🔍 Search: "${term}"`);
    products.forEach(p => {
      console.log(`   ✓ ${p.name}`);
      console.log(`     Category: ${p.category} | Price: $${p.price.toFixed(2)} | Stock: ${p.stock}`);
    });
  }

  await prisma.$disconnect();
}

testProducts().catch(console.error);

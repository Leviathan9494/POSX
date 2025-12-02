import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStock() {
  console.log('Updating product stock levels...');

  // Update all products with zero or low stock
  const result = await prisma.product.updateMany({
    where: {
      stock: {
        lt: 10
      }
    },
    data: {
      stock: 50
    }
  });

  console.log(`✅ Updated ${result.count} products to have 50 units in stock`);

  // Get total product count
  const totalProducts = await prisma.product.count();
  console.log(`📦 Total products in database: ${totalProducts}`);

  // Show some sample products
  const sampleProducts = await prisma.product.findMany({
    take: 10,
    select: {
      name: true,
      stock: true,
      price: true
    }
  });

  console.log('\nSample products:');
  sampleProducts.forEach(p => {
    console.log(`  ${p.name}: ${p.stock} units @ $${p.price.toFixed(2)}`);
  });

  await prisma.$disconnect();
}

updateStock().catch(console.error);

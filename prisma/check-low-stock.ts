import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLowStock() {
  console.log('Checking low stock configuration...\n');

  // Check sample products
  const sampleProducts = await prisma.product.findMany({
    take: 10,
    select: {
      name: true,
      stock: true,
      minStock: true
    }
  });

  console.log('Sample products:');
  sampleProducts.forEach(p => {
    const isLowStock = p.stock <= p.minStock;
    console.log(`  ${p.name}`);
    console.log(`    Stock: ${p.stock} | Min: ${p.minStock} | Low Stock: ${isLowStock}`);
  });

  // Count products by minStock
  const productsWithZeroMin = await prisma.product.count({
    where: { minStock: 0 }
  });

  const productsWithPositiveMin = await prisma.product.count({
    where: { minStock: { gt: 0 } }
  });

  console.log(`\n📊 Statistics:`);
  console.log(`  Products with minStock = 0: ${productsWithZeroMin}`);
  console.log(`  Products with minStock > 0: ${productsWithPositiveMin}`);

  // Count actual low stock (where stock <= minStock)
  const lowStockCount = await prisma.product.count({
    where: {
      stock: {
        lte: prisma.product.fields.minStock
      }
    }
  });

  // Alternative: Check for stock < 10
  const stockBelow10 = await prisma.product.count({
    where: { stock: { lt: 10 } }
  });

  const stockBelow20 = await prisma.product.count({
    where: { stock: { lt: 20 } }
  });

  console.log(`\n  Products with stock < 10: ${stockBelow10}`);
  console.log(`  Products with stock < 20: ${stockBelow20}`);

  await prisma.$disconnect();
}

checkLowStock().catch(console.error);

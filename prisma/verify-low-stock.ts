import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLowStock() {
  const lowStockCount = await prisma.product.count({
    where: {
      stock: { lt: 15 }
    }
  });

  console.log(`Low stock items (stock < 15): ${lowStockCount}`);

  const items = await prisma.product.findMany({
    where: { stock: { lt: 15 } },
    take: 10,
    select: { name: true, stock: true, minStock: true, category: true }
  });

  console.log('\nSample low stock items:');
  items.forEach(i => {
    console.log(`  ${i.name.substring(0, 50)}`);
    console.log(`    Stock: ${i.stock} | Min: ${i.minStock} | ${i.category}`);
  });

  await prisma.$disconnect();
}

verifyLowStock();

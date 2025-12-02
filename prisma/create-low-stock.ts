import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createLowStockItems() {
  console.log('Creating low stock test items...\n');

  // Set some random products to have low stock
  const allProducts = await prisma.product.findMany({
    take: 20
  });

  let updated = 0;
  for (const product of allProducts.slice(0, 15)) {
    // Set stock to random low number (0-8)
    const lowStock = Math.floor(Math.random() * 9);
    
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: lowStock, minStock: 10 }
    });
    
    console.log(`✓ ${product.name}: Stock set to ${lowStock} (Min: 10)`);
    updated++;
  }

  console.log(`\n✅ Created ${updated} low stock items for testing`);

  // Show current low stock count
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: 10
      }
    },
    take: 10,
    select: {
      name: true,
      stock: true,
      minStock: true,
      category: true
    }
  });

  console.log(`\n📦 Low Stock Items (${lowStockProducts.length} shown):`);
  lowStockProducts.forEach(p => {
    console.log(`  ${p.name}`);
    console.log(`    Stock: ${p.stock} | Min: ${p.minStock} | Category: ${p.category}`);
  });

  await prisma.$disconnect();
}

createLowStockItems().catch(console.error);

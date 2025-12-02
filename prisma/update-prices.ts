import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('Updating product prices...');

  // Category-based pricing
  const categoryPrices: Record<string, { min: number; max: number }> = {
    'Vaporizers': { min: 49.99, max: 299.99 },
    'Vape Accessories': { min: 9.99, max: 79.99 },
    'Disposable Vapes': { min: 15.99, max: 29.99 },
    'E-Liquid': { min: 14.99, max: 34.99 },
    'Batteries': { min: 8.99, max: 24.99 },
    'Chargers': { min: 12.99, max: 39.99 },
    'Coils': { min: 4.99, max: 19.99 },
    'Tanks': { min: 19.99, max: 54.99 },
    'Mods': { min: 39.99, max: 199.99 },
    'Pod Systems': { min: 24.99, max: 79.99 },
    'Pre-Rolled': { min: 8.99, max: 24.99 },
    'Flower': { min: 29.99, max: 89.99 },
    'Edibles': { min: 12.99, max: 39.99 },
    'Concentrates': { min: 34.99, max: 79.99 },
    'Papers': { min: 2.99, max: 12.99 },
    'Grinders': { min: 9.99, max: 49.99 },
    'Storage': { min: 6.99, max: 34.99 },
    'Accessories': { min: 4.99, max: 29.99 },
  };

  // Get products with zero or very low prices
  const products = await prisma.product.findMany({
    where: {
      price: {
        lt: 1
      }
    }
  });

  console.log(`Found ${products.length} products with prices under $1.00`);

  let updated = 0;
  for (const product of products) {
    const priceRange = categoryPrices[product.category] || { min: 9.99, max: 49.99 };
    
    // Generate random price within category range
    const price = parseFloat(
      (Math.random() * (priceRange.max - priceRange.min) + priceRange.min).toFixed(2)
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { price }
    });

    updated++;
    
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated} products...`);
    }
  }

  console.log(`✅ Updated ${updated} products with valid prices`);

  // Show some examples
  const sampleProducts = await prisma.product.findMany({
    take: 10,
    where: {
      price: {
        gt: 0
      }
    },
    select: {
      name: true,
      category: true,
      price: true,
      stock: true
    }
  });

  console.log('\nSample products with prices:');
  sampleProducts.forEach(p => {
    console.log(`  ${p.name} (${p.category}): $${p.price.toFixed(2)} - Stock: ${p.stock}`);
  });

  await prisma.$disconnect();
}

updatePrices().catch(console.error);

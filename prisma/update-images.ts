import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function updateProductImages() {
  console.log('Reading CSV file...');
  
  const csvPath = path.join(process.cwd(), 'products_export_2025-11-17_18-21-54.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Parse header
  const headers = lines[0].split(',');
  const skuIndex = headers.findIndex(h => h === 'SKU');
  const imageIndex = headers.findIndex(h => h === 'Images');
  const titleIndex = headers.findIndex(h => h === 'US_Title_Long');
  
  console.log(`Found columns - SKU: ${skuIndex}, Images: ${imageIndex}, Title: ${titleIndex}`);
  
  let updated = 0;
  let notFound = 0;
  
  // Process each line (skip header)
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const columns = lines[i].split(',');
    const sku = columns[skuIndex]?.trim();
    const imageUrl = columns[imageIndex]?.trim();
    
    if (!sku || !imageUrl || imageUrl === '""' || imageUrl === '') continue;
    
    try {
      // Find product by SKU
      const product = await prisma.product.findUnique({
        where: { sku: sku }
      });
      
      if (product) {
        // Update with image URL
        await prisma.product.update({
          where: { id: product.id },
          data: { image: imageUrl }
        });
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`  Updated ${updated} products with images...`);
        }
      } else {
        notFound++;
      }
    } catch (error) {
      // Skip products that don't exist
      notFound++;
    }
  }
  
  console.log(`\n✅ Updated ${updated} products with image URLs`);
  console.log(`⚠️  ${notFound} SKUs not found in database`);
  
  // Show sample products with images
  const sampleProducts = await prisma.product.findMany({
    where: {
      image: {
        not: null
      }
    },
    take: 5,
    select: {
      name: true,
      category: true,
      price: true,
      image: true
    }
  });
  
  console.log('\nSample products with images:');
  sampleProducts.forEach(p => {
    console.log(`  ${p.name}`);
    console.log(`    Category: ${p.category} | Price: $${p.price.toFixed(2)}`);
    console.log(`    Image: ${p.image?.substring(0, 60)}...`);
  });
  
  await prisma.$disconnect();
}

updateProductImages().catch(console.error);

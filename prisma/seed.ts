import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Parse CSV data
function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Simple CSV parser (handles basic cases)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    const product: any = {};
    headers.forEach((header, index) => {
      product[header.trim()] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
    });
    
    products.push(product);
  }
  
  return products;
}

async function seed() {
  console.log('🌱 Starting seed...');
  
  const csvPath = path.join(__dirname, '../products_export_2025-11-17_18-21-54.csv');
  const products = parseCSV(csvPath);
  
  console.log(`📦 Found ${products.length} products to import`);
  
  let created = 0;
  let skipped = 0;
  
  for (const item of products) {
    try {
      // Skip if product is not visible or has no name
      if (item.Visible === 'N' || !item.US_Title_Short) {
        skipped++;
        continue;
      }
      
      // Parse price and stock
      const price = parseFloat(item.Price) || 0;
      const cost = parseFloat(item.Price_Cost) || price * 0.6; // Default cost if not provided
      const stock = parseInt(item.Stock_Level) || 0;
      const minStock = parseInt(item.Stock_Min) || 5;
      
      // Extract first image URL
      const images = item.Images ? item.Images.split(',')[0].trim() : null;
      
      // Determine category
      let category = item.US_Category_2 || item.US_Category_1 || 'Accessories';
      if (!category || category.trim() === '') {
        category = 'Accessories';
      }
      
      // Create or update product
      await prisma.product.upsert({
        where: { sku: item.SKU || `PROD-${item.Internal_ID}` },
        update: {
          name: item.US_Title_Short,
          description: item.US_Description_Short || item.US_Title_Long || '',
          price: price,
          cost: cost,
          stock: stock,
          minStock: minStock,
          category: category,
          image: images,
          barcode: item.EAN || null,
          active: item.Visible === 'S',
        },
        create: {
          name: item.US_Title_Short,
          description: item.US_Description_Short || item.US_Title_Long || '',
          sku: item.SKU || `PROD-${item.Internal_ID}`,
          price: price,
          cost: cost,
          stock: stock,
          minStock: minStock,
          category: category,
          image: images,
          barcode: item.EAN || null,
          unit: item.Unit || 'unit',
          taxRate: parseFloat(item.Tax) || 0.1,
          active: item.Visible === 'S',
        },
      });
      
      created++;
      if (created % 10 === 0) {
        console.log(`✅ Imported ${created} products...`);
      }
    } catch (error) {
      console.error(`❌ Error importing product ${item.US_Title_Short}:`, error);
    }
  }
  
  console.log(`\n✨ Seed completed!`);
  console.log(`   - Created/Updated: ${created} products`);
  console.log(`   - Skipped: ${skipped} products`);
  
  // Create sample customers
  console.log('\n👥 Creating sample customers...');
  
  const customers = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '204-555-0101',
      address: '123 Main St, Winnipeg, MB',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '204-555-0102',
      address: '456 Oak Ave, Winnipeg, MB',
    },
    {
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      phone: '204-555-0103',
      address: '789 Elm St, Winnipeg, MB',
    },
  ];
  
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: customer,
      create: customer,
    });
  }
  
  console.log(`✅ Created ${customers.length} sample customers`);
  
  // Create business config
  console.log('\n⚙️ Creating business configuration...');
  
  await prisma.businessConfig.upsert({
    where: { id: 'default' },
    update: {
      businessType: 'retail',
      businessName: 'Flamingo Plus',
      currency: 'CAD',
      taxRate: 0.13, // 13% GST/PST for Manitoba
      receipt: JSON.stringify({
        footer: 'Thank you for your purchase!',
        showTax: true,
        showItems: true,
      }),
      features: JSON.stringify({
        loyaltyProgram: false,
        appointments: false,
        tableManagement: false,
      }),
    },
    create: {
      id: 'default',
      businessType: 'retail',
      businessName: 'Flamingo Plus',
      currency: 'CAD',
      taxRate: 0.13,
      receipt: JSON.stringify({
        footer: 'Thank you for your purchase!',
        showTax: true,
        showItems: true,
      }),
      features: JSON.stringify({
        loyaltyProgram: false,
        appointments: false,
        tableManagement: false,
      }),
    },
  });
  
  console.log('✅ Business configuration created');
  console.log('\n🎉 Database seeded successfully!\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

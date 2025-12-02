import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating customer purchase histories with realistic patterns...');

  // Clear existing sales to regenerate with better patterns
  console.log('Clearing old sales data...');
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  
  // Get all products grouped by category
  const allProducts = await prisma.product.findMany({
    where: { active: true }
  });
  
  if (allProducts.length === 0) {
    console.log('⚠️  No products found. Please seed products first.');
    return;
  }

  // Group products by category
  const productsByCategory = allProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof allProducts>);

  const categories = Object.keys(productsByCategory);
  console.log(`Found ${categories.length} categories: ${categories.join(', ')}`);

  // Get all customers
  const customers = await prisma.customer.findMany();
  
  if (customers.length === 0) {
    console.log('⚠️  No customers found. Please run seed-customers.ts first.');
    return;
  }

  console.log(`Processing ${customers.length} customers...`);

  // Define customer personas with product preferences
  const customerPreferences = {
    'John Smith': {
      categories: ['Vaporizers', 'Vape & Accessories', 'Nicotine Hardware'],
      brands: ['Puffco', 'Pax', 'Storz'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 14
    },
    'Sarah Johnson': {
      categories: ['Pre-Rolled', 'Papers, Wraps & Cones', 'Lighters & Torches'],
      brands: ['Raw', 'Zig', 'Elements'],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 7
    },
    'Michael Chen': {
      categories: ['Flower', 'Pre-Rolled', 'Edibles', 'Concentrates'],
      brands: [], // Will buy any brand
      avgItemsPerPurchase: 8, // Wholesale
      purchaseFrequency: 30
    },
    'Emily Davis': {
      categories: ['Edibles', 'THC Beverages', 'Topicals'],
      brands: ['Good', 'Simply', 'House'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 14
    },
    'Robert Wilson': {
      categories: ['Vape Cartridges', 'Concentrates', 'Vaporizers'],
      brands: ['Puffco', 'Pax', '510'],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 10
    },
    'Jennifer Martinez': {
      categories: ['Papers, Wraps & Cones', 'Lighters & Torches', 'Smoking Devices'],
      brands: ['Raw', 'Clipper', 'Bic'],
      avgItemsPerPurchase: 4,
      purchaseFrequency: 7
    },
    'David Brown': {
      categories: ['Disposable Vapes', 'Nicotine Vapes', 'Salt Nicotine Eliquid'],
      brands: ['Allo', 'Stlth', 'Vuse'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 5
    },
    'Lisa Anderson': {
      categories: ['Flower', 'Pre-Rolled', 'Papers, Wraps & Cones', 'Edibles'],
      brands: ['Raw', 'Elements'],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 7
    },
    'James Taylor': {
      categories: ['Concentrates', 'Vape Cartridges', 'Vaporizers'],
      brands: ['Puffco', '510'],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 10
    },
    'Amanda White': {
      categories: ['Edibles', 'Oils Ingested', 'Topicals'],
      brands: ['Good', 'Simply'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 14
    },
    'Christopher Lee': {
      categories: ['Vaporizers', 'Vape & Accessories', 'Concentrate Accessories'],
      brands: ['Puffco', 'Pax', 'Storz'],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 21
    },
    'Jessica Garcia': {
      categories: ['Flower', 'Pre-Rolled', 'Smoking Devices'],
      brands: ['Grav', 'Marley'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 7
    },
    'Daniel Harris': {
      categories: ['Papers, Wraps & Cones', 'Lighters & Torches', 'Smoking Accessories'],
      brands: ['Raw', 'Zig', 'Clipper'],
      avgItemsPerPurchase: 5,
      purchaseFrequency: 10
    },
    'Michelle Clark': {
      categories: ['Disposable Vapes', 'Nicotine Vapes', 'Freebase Nicotine Eliquid'],
      brands: ['Allo', 'Vuse', 'Stlth'],
      avgItemsPerPurchase: 2,
      purchaseFrequency: 5
    },
    'Ryan Rodriguez': {
      categories: ['SWAG', 'Hoodie / Sweater', 'T Shirt', 'Hats/Toques'],
      brands: ['Raw', 'Cookies'],
      avgItemsPerPurchase: 1,
      purchaseFrequency: 60
    },
    'Mike Wilson': {
      categories: ['Vape Cartridges', 'Concentrates', 'Flower'],
      brands: [],
      avgItemsPerPurchase: 3,
      purchaseFrequency: 7
    }
  };

  for (const customer of customers) {
    const preferences = customerPreferences[customer.name as keyof typeof customerPreferences];
    
    if (!preferences) {
      console.log(`⚠️  No preferences defined for ${customer.name}, skipping...`);
      continue;
    }

    // Generate 5-20 purchases over last 6 months
    const numPurchases = Math.floor(Math.random() * 16) + 5;
    let totalSpent = 0;
    const purchaseDates: Date[] = [];

    console.log(`\n👤 ${customer.name}:`);
    console.log(`   Preferences: ${preferences.categories.join(', ')}`);
    console.log(`   Brands: ${preferences.brands.join(', ')}`);
    
    for (let i = 0; i < numPurchases; i++) {
      // Calculate purchase date based on frequency
      const daysAgo = i * preferences.purchaseFrequency + Math.floor(Math.random() * preferences.purchaseFrequency);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.min(daysAgo, 180)); // Max 6 months ago
      purchaseDates.push(saleDate);

      // Select products based on preferences
      const saleItems = [];
      const numItems = Math.floor(Math.random() * 2) + Math.max(1, preferences.avgItemsPerPurchase - 1);
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        // Pick a preferred category
        const category = preferences.categories[Math.floor(Math.random() * preferences.categories.length)];
        const categoryProducts = productsByCategory[category] || [];
        
        if (categoryProducts.length === 0) continue;

        // Filter by preferred brands if available
        let filteredProducts = categoryProducts.filter(p => 
          preferences.brands.some(brand => p.name.toLowerCase().includes(brand.toLowerCase()))
        );
        
        // Fallback to any product in category if no brand match
        if (filteredProducts.length === 0) {
          filteredProducts = categoryProducts;
        }

        const product = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
        const quantity = customer.name === 'Michael Chen' 
          ? Math.floor(Math.random() * 5) + 3  // Wholesale: 3-7
          : Math.floor(Math.random() * 2) + 1; // Retail: 1-2

        const unitPrice = product.price;
        const itemTotal = unitPrice * quantity;
        
        saleItems.push({
          productId: product.id,
          quantity,
          unitPrice,
          discount: 0,
          tax: itemTotal * 0.08,
          total: itemTotal
        });
        
        subtotal += itemTotal;
      }

      if (saleItems.length === 0) continue;

      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      totalSpent += total;
      
      const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.sale.create({
        data: {
          saleNumber,
          customerId: customer.id,
          subtotal,
          tax,
          discount: 0,
          total,
          paymentMethod: ['cash', 'card', 'digital'][Math.floor(Math.random() * 3)],
          status: 'completed',
          createdAt: saleDate,
          items: {
            create: saleItems
          }
        }
      });
    }
    
    // Update customer totals
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent,
        visitCount: numPurchases,
        lastVisit: purchaseDates[0] // Most recent
      }
    });
    
    console.log(`   ✓ Created ${numPurchases} purchases (Total: $${totalSpent.toFixed(2)})`);
  }

  console.log('\n✅ Purchase history updated successfully!');
  
  // Summary
  const customerCount = await prisma.customer.count();
  const saleCount = await prisma.sale.count();
  const saleItemCount = await prisma.saleItem.count();
  const totalRevenue = await prisma.sale.aggregate({
    _sum: { total: true }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Customers: ${customerCount}`);
  console.log(`   Sales: ${saleCount}`);
  console.log(`   Items Sold: ${saleItemCount}`);
  console.log(`   Total Revenue: $${totalRevenue._sum.total?.toFixed(2) || '0.00'}`);
  
  // Show sample customer insights
  console.log('\n🔍 Sample Customer Insights:');
  const johnSmith = await prisma.customer.findFirst({
    where: { name: 'John Smith' },
    include: {
      sales: {
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });
  
  if (johnSmith) {
    console.log(`\n   ${johnSmith.name}:`);
    console.log(`   - Total Spent: $${johnSmith.totalSpent.toFixed(2)}`);
    console.log(`   - Visits: ${johnSmith.visitCount}`);
    console.log(`   - Recent Purchases:`);
    johnSmith.sales.forEach(sale => {
      console.log(`     • ${new Date(sale.createdAt).toLocaleDateString()}: ${sale.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error updating purchase history:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

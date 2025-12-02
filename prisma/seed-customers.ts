import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding customer data...');

  // Get some products for creating sales history
  const products = await prisma.product.findMany({
    take: 50,
    orderBy: { createdAt: 'asc' }
  });

  if (products.length === 0) {
    console.log('⚠️  No products found. Please seed products first.');
    return;
  }

  // Create diverse customers with realistic data
  const customers = [
    {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Springfield, IL 62701',
      notes: 'Regular customer, prefers Samsung batteries'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Springfield, IL 62702',
      notes: 'Interested in mod kits and coils'
    },
    {
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Springfield, IL 62703',
      notes: 'Wholesale buyer, large orders'
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Springfield, IL 62704',
      notes: 'New vaper, needs beginner-friendly products'
    },
    {
      name: 'Robert Wilson',
      email: 'rwilson@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Springfield, IL 62705',
      notes: 'VIP customer, premium products only'
    },
    {
      name: 'Jennifer Martinez',
      email: 'jmartinez@email.com',
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Springfield, IL 62706',
      notes: 'Prefers LG batteries and SMOK products'
    },
    {
      name: 'David Brown',
      email: 'dbrown@email.com',
      phone: '+1 (555) 789-0123',
      address: '147 Birch St, Springfield, IL 62707',
      notes: 'Budget-conscious, looks for deals'
    },
    {
      name: 'Lisa Anderson',
      email: 'landerson@email.com',
      phone: '+1 (555) 890-1234',
      address: '258 Willow Way, Springfield, IL 62708',
      notes: 'Regular weekly visitor, likes variety'
    },
    {
      name: 'James Taylor',
      email: 'jtaylor@email.com',
      phone: '+1 (555) 901-2345',
      address: '369 Spruce Ave, Springfield, IL 62709',
      notes: 'Cloud chaser, high-powered setups'
    },
    {
      name: 'Amanda White',
      email: 'awhite@email.com',
      phone: '+1 (555) 012-3456',
      address: '741 Ash Blvd, Springfield, IL 62710',
      notes: 'Flavor enthusiast, interested in coils'
    },
    {
      name: 'Christopher Lee',
      email: 'clee@email.com',
      phone: '+1 (555) 123-4568',
      address: '852 Poplar St, Springfield, IL 62711',
      notes: 'Tech-savvy, likes latest mods'
    },
    {
      name: 'Jessica Garcia',
      email: 'jgarcia@email.com',
      phone: '+1 (555) 234-5679',
      address: '963 Hickory Rd, Springfield, IL 62712',
      notes: 'Safety-conscious, always asks for recommendations'
    },
    {
      name: 'Daniel Harris',
      email: 'dharris@email.com',
      phone: '+1 (555) 345-6780',
      address: '159 Walnut Dr, Springfield, IL 62713',
      notes: 'DIY builder, buys batteries and wire'
    },
    {
      name: 'Michelle Clark',
      email: 'mclark@email.com',
      phone: '+1 (555) 456-7891',
      address: '357 Cherry Ln, Springfield, IL 62714',
      notes: 'Store credit account holder'
    },
    {
      name: 'Ryan Rodriguez',
      email: 'rrodriguez@email.com',
      phone: '+1 (555) 567-8902',
      address: '486 Beech Ave, Springfield, IL 62715',
      notes: 'Influencer, large social media following'
    }
  ];

  console.log(`Creating ${customers.length} customers...`);
  
  for (const customerData of customers) {
    const customer = await prisma.customer.create({
      data: customerData
    });
    
    console.log(`✓ Created customer: ${customer.name}`);
    
    // Generate random purchase history for each customer (1-15 purchases)
    const numPurchases = Math.floor(Math.random() * 15) + 1;
    let totalSpent = 0;
    
    for (let i = 0; i < numPurchases; i++) {
      // Random date in the last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - daysAgo);
      
      // Random number of items per sale (1-5)
      const numItems = Math.floor(Math.random() * 5) + 1;
      const saleItems = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.price;
        const itemTotal = unitPrice * quantity;
        
        saleItems.push({
          productId: product.id,
          quantity,
          unitPrice,
          discount: 0,
          tax: itemTotal * 0.08, // 8% tax
          total: itemTotal
        });
        
        subtotal += itemTotal;
      }
      
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      totalSpent += total;
      
      // Generate unique sale number
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
    
    // Update customer with total spent and visit count
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent,
        visitCount: numPurchases,
        lastVisit: new Date()
      }
    });
    
    console.log(`  → Generated ${numPurchases} purchases (Total: $${totalSpent.toFixed(2)})`);
  }

  console.log('✅ Customer data seeded successfully!');
  
  // Summary
  const customerCount = await prisma.customer.count();
  const saleCount = await prisma.sale.count();
  const totalRevenue = await prisma.sale.aggregate({
    _sum: { total: true }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Customers: ${customerCount}`);
  console.log(`   Sales: ${saleCount}`);
  console.log(`   Total Revenue: $${totalRevenue._sum.total?.toFixed(2) || '0.00'}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import * as fs from 'fs';
import * as path from 'path';

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

async function generateMockData() {
  console.log('🔄 Generating mock data from CSV...');
  
  const csvPath = path.join(process.cwd(), 'products_export_2025-11-17_18-21-54.csv');
  const rawProducts = parseCSV(csvPath);
  
  console.log(`📦 Found ${rawProducts.length} products to process`);
  
  const mockProducts = [];
  let skipped = 0;
  
  for (let i = 0; i < rawProducts.length; i++) {
    const item = rawProducts[i];
    
    // Skip if product is not visible or has no name
    if (item.Visible === 'N' || !item.US_Title_Short) {
      skipped++;
      continue;
    }
    
    // Parse price and stock - ensure minimum values
    let price = parseFloat(item.Price) || 0;
    if (price <= 0) {
      price = 9.99; // Default price if missing
    }
    
    const cost = parseFloat(item.Price_Cost) || price * 0.6;
    
    let stock = parseInt(item.Stock_Level) || 0;
    if (stock <= 0) {
      stock = Math.floor(Math.random() * 50) + 10; // Random stock between 10-60
    }
    
    const minStock = parseInt(item.Stock_Min) || 5;
    
    // Extract first image URL - provide placeholder if missing
    let image = item.Images ? item.Images.split(',')[0].trim() : null;
    if (!image || image === '') {
      image = `https://placehold.co/400x400/1e293b/white?text=${encodeURIComponent(item.US_Title_Short.substring(0, 20))}`;
    }
    
    // Determine category
    let category = item.US_Category_2 || item.US_Category_1 || 'Accessories';
    if (!category || category.trim() === '') {
      category = 'Accessories';
    }
    
    // Truncate description if too long
    let description = item.US_Description_Short || item.US_Title_Long || '';
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }
    
    mockProducts.push({
      id: String(i + 1),
      name: item.US_Title_Short,
      description,
      sku: item.SKU || `PROD-${item.Internal_ID}`,
      barcode: item.EAN || null,
      category,
      price,
      cost,
      stock,
      minStock,
      image,
      active: item.Visible === 'S',
    });
    
    if (mockProducts.length % 100 === 0) {
      console.log(`✅ Processed ${mockProducts.length} products...`);
    }
  }
  
  console.log(`\n✨ Processed ${mockProducts.length} products (skipped ${skipped})`);
  
  // Customer data from seed-customers.ts
  const mockCustomers = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Springfield, IL 62701',
      notes: 'Regular customer, prefers Samsung batteries',
      totalSpent: 2450.75,
      visitCount: 15,
      lastVisit: new Date('2024-11-28'),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Springfield, IL 62702',
      notes: 'Interested in mod kits and coils',
      totalSpent: 1850.50,
      visitCount: 12,
      lastVisit: new Date('2024-11-30'),
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Springfield, IL 62703',
      notes: 'Wholesale buyer, large orders',
      totalSpent: 3200.25,
      visitCount: 20,
      lastVisit: new Date('2024-12-01'),
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Springfield, IL 62704',
      notes: 'New vaper, needs beginner-friendly products',
      totalSpent: 950.00,
      visitCount: 7,
      lastVisit: new Date('2024-11-25'),
    },
    {
      id: '5',
      name: 'Robert Wilson',
      email: 'rwilson@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Springfield, IL 62705',
      notes: 'VIP customer, premium products only',
      totalSpent: 4100.80,
      visitCount: 25,
      lastVisit: new Date('2024-12-02'),
    },
    {
      id: '6',
      name: 'Jennifer Martinez',
      email: 'jmartinez@email.com',
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Springfield, IL 62706',
      notes: 'Prefers LG batteries and SMOK products',
      totalSpent: 1650.30,
      visitCount: 10,
      lastVisit: new Date('2024-11-29'),
    },
    {
      id: '7',
      name: 'David Brown',
      email: 'dbrown@email.com',
      phone: '+1 (555) 789-0123',
      address: '147 Birch St, Springfield, IL 62707',
      notes: 'Budget-conscious, looks for deals',
      totalSpent: 780.50,
      visitCount: 14,
      lastVisit: new Date('2024-11-27'),
    },
    {
      id: '8',
      name: 'Lisa Anderson',
      email: 'landerson@email.com',
      phone: '+1 (555) 890-1234',
      address: '258 Willow Way, Springfield, IL 62708',
      notes: 'Regular weekly visitor, likes variety',
      totalSpent: 2890.60,
      visitCount: 22,
      lastVisit: new Date('2024-12-01'),
    },
    {
      id: '9',
      name: 'James Taylor',
      email: 'jtaylor@email.com',
      phone: '+1 (555) 901-2345',
      address: '369 Spruce Ave, Springfield, IL 62709',
      notes: 'Cloud chaser, high-powered setups',
      totalSpent: 3450.75,
      visitCount: 18,
      lastVisit: new Date('2024-11-30'),
    },
    {
      id: '10',
      name: 'Amanda White',
      email: 'awhite@email.com',
      phone: '+1 (555) 012-3456',
      address: '741 Ash Blvd, Springfield, IL 62710',
      notes: 'Flavor enthusiast, interested in coils',
      totalSpent: 1560.25,
      visitCount: 11,
      lastVisit: new Date('2024-11-28'),
    },
    {
      id: '11',
      name: 'Christopher Lee',
      email: 'clee@email.com',
      phone: '+1 (555) 123-4568',
      address: '852 Poplar St, Springfield, IL 62711',
      notes: 'Tech-savvy, likes latest mods',
      totalSpent: 2980.40,
      visitCount: 16,
      lastVisit: new Date('2024-12-02'),
    },
    {
      id: '12',
      name: 'Jessica Garcia',
      email: 'jgarcia@email.com',
      phone: '+1 (555) 234-5679',
      address: '963 Hickory Rd, Springfield, IL 62712',
      notes: 'Safety-conscious, always asks for recommendations',
      totalSpent: 1340.80,
      visitCount: 9,
      lastVisit: new Date('2024-11-26'),
    },
    {
      id: '13',
      name: 'Daniel Harris',
      email: 'dharris@email.com',
      phone: '+1 (555) 345-6780',
      address: '159 Walnut Dr, Springfield, IL 62713',
      notes: 'DIY builder, buys batteries and wire',
      totalSpent: 2150.90,
      visitCount: 19,
      lastVisit: new Date('2024-12-01'),
    },
    {
      id: '14',
      name: 'Michelle Clark',
      email: 'mclark@email.com',
      phone: '+1 (555) 456-7891',
      address: '357 Cherry Ln, Springfield, IL 62714',
      notes: 'Store credit account holder',
      totalSpent: 3670.55,
      visitCount: 24,
      lastVisit: new Date('2024-12-02'),
    },
    {
      id: '15',
      name: 'Ryan Rodriguez',
      email: 'rrodriguez@email.com',
      phone: '+1 (555) 567-8902',
      address: '486 Beech Ave, Springfield, IL 62715',
      notes: 'Influencer, large social media following',
      totalSpent: 4250.30,
      visitCount: 21,
      lastVisit: new Date('2024-12-01'),
    },
  ];
  
  // Generate realistic sales data
  console.log('\n💰 Generating sales data...');
  const mockSales = [];
  let saleId = 1;
  
  for (const customer of mockCustomers) {
    const numSales = customer.visitCount;
    
    for (let i = 0; i < numSales; i++) {
      // Random date within last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - daysAgo);
      
      // Random 1-5 items per sale
      const numItems = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = mockProducts[Math.floor(Math.random() * Math.min(1000, mockProducts.length))];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.price;
        const itemTotal = unitPrice * quantity;
        
        items.push({
          id: String(saleId * 10 + j),
          saleId: String(saleId),
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
          },
          quantity,
          unitPrice,
          discount: 0,
          tax: itemTotal * 0.08,
          total: itemTotal,
        });
        
        subtotal += itemTotal;
      }
      
      const tax = subtotal * 0.08;
      const discount = Math.random() < 0.2 ? Math.floor(Math.random() * 20) + 5 : 0;
      const total = subtotal + tax - discount;
      
      mockSales.push({
        id: String(saleId),
        saleNumber: `SALE-2024-${String(saleId).padStart(5, '0')}`,
        customerId: customer.id,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: ['cash', 'credit_card', 'debit_card'][Math.floor(Math.random() * 3)],
        createdAt: saleDate,
        updatedAt: saleDate,
        items,
      });
      
      saleId++;
    }
  }
  
  console.log(`✅ Generated ${mockSales.length} sales transactions`);
  
  // Write to TypeScript file with compressed formatting
  console.log('\n📝 Writing optimized mock data file...');
  
  const output = `// Auto-generated mock data from CSV (optimized)
// Products: ${mockProducts.length} | Customers: ${mockCustomers.length} | Sales: ${mockSales.length}
// Generated: ${new Date().toISOString()}

export const mockProducts = ${JSON.stringify(mockProducts)};

export const mockCustomers = ${JSON.stringify(mockCustomers)};

export const mockSales = ${JSON.stringify(mockSales)};
`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'lib', 'mock-data.ts'),
    output,
    'utf-8'
  );
  
  const fileSize = fs.statSync(path.join(process.cwd(), 'lib', 'mock-data.ts')).size;
  console.log(`✅ Mock data file generated: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n📊 Summary:`);
  console.log(`   Products: ${mockProducts.length}`);
  console.log(`   Customers: ${mockCustomers.length}`);
  console.log(`   Sales: ${mockSales.length}`);
  console.log(`   Total Revenue: $${mockSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}`);
}

generateMockData().catch(console.error);

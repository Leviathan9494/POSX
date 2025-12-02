import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get all sales for this customer with items
    const sales = await prisma.sale.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Analyze purchase patterns
    const productFrequency = new Map<string, { 
      product: any; 
      count: number; 
      totalQuantity: number;
      lastPurchased: Date;
      totalSpent: number;
    }>();

    const categoryFrequency = new Map<string, number>();
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Track product frequency
        const existing = productFrequency.get(item.productId);
        if (existing) {
          existing.count++;
          existing.totalQuantity += item.quantity;
          existing.totalSpent += item.total;
          if (sale.createdAt > existing.lastPurchased) {
            existing.lastPurchased = sale.createdAt;
          }
        } else {
          productFrequency.set(item.productId, {
            product: item.product,
            count: 1,
            totalQuantity: item.quantity,
            lastPurchased: sale.createdAt,
            totalSpent: item.total
          });
        }

        // Track category frequency
        const category = item.product.category;
        categoryFrequency.set(category, (categoryFrequency.get(category) || 0) + 1);
      });
    });

    // Get top purchased products
    const topProducts = Array.from(productFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get favorite categories
    const favoriteCategories = Array.from(categoryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // Generate recommendations based on:
    // 1. Products in favorite categories that customer hasn't bought
    // 2. Products frequently bought together with their favorites
    // 3. New products in their favorite categories

    const favoriteProductIds = Array.from(productFrequency.keys());
    const topCategories = favoriteCategories.slice(0, 3).map(c => c.category);

    const recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { active: true },
          { category: { in: topCategories } },
          { id: { notIn: favoriteProductIds } }, // Products they haven't bought
          { stock: { gt: 0 } } // In stock
        ]
      },
      take: 12,
      orderBy: [
        { createdAt: 'desc' } // Prefer newer products
      ]
    });

    // Calculate customer insights
    const avgOrderValue = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length 
      : 0;

    const daysSinceLastVisit = customer.lastVisit 
      ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const purchaseFrequency = sales.length > 1 ? (() => {
      const dates = sales.map(s => new Date(s.createdAt).getTime()).sort((a, b) => a - b);
      const gaps = [];
      for (let i = 1; i < dates.length; i++) {
        gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      }
      return gaps.length > 0 ? gaps.reduce((a, b) => a + b) / gaps.length : null;
    })() : null;

    return NextResponse.json({
      customer,
      purchaseHistory: sales,
      insights: {
        totalPurchases: sales.length,
        totalSpent: customer.totalSpent,
        avgOrderValue,
        daysSinceLastVisit,
        avgPurchaseFrequencyDays: purchaseFrequency,
        topProducts,
        favoriteCategories
      },
      recommendations
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}

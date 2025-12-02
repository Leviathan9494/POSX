import { NextResponse } from 'next/server';
import { mockCustomers, mockSales, mockProducts } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get customer from mock data
    const customer = mockCustomers.find(c => c.id === customerId);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get customer's sales
    const customerSales = mockSales.filter(s => s.customerId === customerId);

    // Analyze purchase patterns
    const productFrequency = new Map<string, { 
      product: any; 
      count: number; 
      totalQuantity: number;
      lastPurchased: Date;
      totalSpent: number;
    }>();

    const categoryFrequency = new Map<string, number>();
    const brandFrequency = new Map<string, number>();
    
    customerSales.forEach(sale => {
      sale.items.forEach(item => {
        // Track product frequency
        const existing = productFrequency.get(item.productId);
        if (existing) {
          existing.count++;
          existing.totalQuantity += item.quantity;
          existing.totalSpent += item.total;
          if (new Date(sale.createdAt) > existing.lastPurchased) {
            existing.lastPurchased = new Date(sale.createdAt);
          }
        } else {
          productFrequency.set(item.productId, {
            product: item.product,
            count: 1,
            totalQuantity: item.quantity,
            lastPurchased: new Date(sale.createdAt),
            totalSpent: item.total
          });
        }

        // Track category frequency
        const category = item.product.category;
        categoryFrequency.set(category, (categoryFrequency.get(category) || 0) + 1);

        // Track brand frequency (extract from product name)
        const brandMatch = item.product.name.match(/^([A-Za-z\s]+)/);
        if (brandMatch) {
          const brand = brandMatch[1].trim();
          brandFrequency.set(brand, (brandFrequency.get(brand) || 0) + 1);
        }
      });
    });

    // Get top purchased products
    const topProducts = Array.from(productFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(p => ({
        ...p.product,
        purchaseCount: p.count,
        totalQuantity: p.totalQuantity,
        lastPurchased: p.lastPurchased
      }));

    // Get favorite categories
    const favoriteCategories = Array.from(categoryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Get favorite brands
    const favoriteBrands = Array.from(brandFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand, count]) => ({ brand, count }));

    // Generate smart recommendations
    const favoriteProductIds = Array.from(productFrequency.keys());
    const topCategories = favoriteCategories.map(c => c.category);

    // Strategy 1: New products in favorite categories (from mock data)
    const categoryRecommendations = mockProducts
      .filter(p => 
        p.active && 
        topCategories.includes(p.category) && 
        !favoriteProductIds.includes(p.id) &&
        p.stock > 0
      )
      .slice(0, 6);

    // Strategy 2: Products bought by similar customers
    const similarCustomerSales = mockSales.filter(s => s.customerId !== customerId);
    
    const collaborativeProducts = new Map<string, { product: any; score: number }>();
    similarCustomerSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!favoriteProductIds.includes(item.productId) && 
            topCategories.includes(item.product.category)) {
          const existing = collaborativeProducts.get(item.productId);
          if (existing) {
            existing.score++;
          } else {
            // Get full product details from mock data
            const fullProduct = mockProducts.find(p => p.id === item.productId);
            if (fullProduct && fullProduct.active && fullProduct.stock > 0) {
              collaborativeProducts.set(item.productId, {
                product: fullProduct,
                score: 1
              });
            }
          }
        }
      });
    });

    const collaborativeRecommendations = Array.from(collaborativeProducts.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(r => r.product);

    // Strategy 3: Replenishment - Products they buy regularly
    const now = new Date();
    const replenishmentRecommendations = Array.from(productFrequency.values())
      .filter(p => {
        const daysSinceLastPurchase = Math.floor((now.getTime() - p.lastPurchased.getTime()) / (1000 * 60 * 60 * 24));
        // Suggest if haven't bought in 14+ days and they usually buy it
        return daysSinceLastPurchase >= 14 && p.count >= 2 && p.product.active && p.product.stock > 0;
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(p => p.product);

    // Combine all recommendations and remove duplicates
    const allRecommendations = [
      ...replenishmentRecommendations,
      ...categoryRecommendations,
      ...collaborativeRecommendations
    ];
    
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(p => [p.id, p])).values()
    ).slice(0, 12);

    // Calculate insights
    const avgOrderValue = customerSales.length > 0 
      ? customer.totalSpent / customerSales.length 
      : 0;

    const daysSinceLastVisit = customer.lastVisit 
      ? Math.floor((now.getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: customer.totalSpent,
        visitCount: customer.visitCount
      },
      insights: {
        avgOrderValue,
        daysSinceLastVisit,
        topProducts,
        favoriteCategories,
        favoriteBrands
      },
      recommendations: uniqueRecommendations,
      recommendationReasons: {
        replenishment: replenishmentRecommendations.length,
        newInFavorites: categoryRecommendations.length,
        similarCustomers: collaborativeRecommendations.length
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

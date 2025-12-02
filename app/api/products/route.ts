import { NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // Return mock data for now
    const products = mockProducts.filter(p => p.active);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newProduct = {
      id: String(mockProducts.length + 1),
      ...data,
      sku: data.sku || `SKU-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // In a real app, this would be saved to database
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

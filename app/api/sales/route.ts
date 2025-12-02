import { NextResponse } from 'next/server';
import { mockSales } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // Return mock data for now
    const sales = [...mockSales].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newSale = {
      id: String(mockSales.length + 1),
      saleNumber: `SALE-${Date.now()}`,
      customerId: data.customerId,
      customer: data.customer,
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount || 0,
      total: data.total,
      paymentMethod: data.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: data.items.map((item: any, index: number) => ({
        id: String(index + 1),
        saleId: String(mockSales.length + 1),
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax,
        total: item.total,
      })),
    };
    
    // In a real app, this would update database
    console.log('Sale created:', newSale.saleNumber);

    return NextResponse.json(newSale);
  } catch (error) {
    console.error('Sale creation error:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}

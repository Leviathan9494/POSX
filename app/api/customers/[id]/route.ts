import { NextResponse } from 'next/server';
import { mockCustomers, mockSales } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = mockCustomers.find(c => c.id === params.id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Get customer's recent sales
    const customerSales = mockSales
      .filter(s => s.customerId === params.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    return NextResponse.json({
      ...customer,
      sales: customerSales
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

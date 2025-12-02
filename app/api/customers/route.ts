import { NextResponse } from 'next/server';
import { mockCustomers } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // Return mock data for now
    const customers = [...mockCustomers].sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCustomer = {
      id: String(mockCustomers.length + 1),
      ...data,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // In a real app, this would be saved to database
    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkDatabase, handleApiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET() {
  const dbCheck = checkDatabase();
  if (dbCheck) return dbCheck;
  
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return handleApiError(error, 'fetch customers');
  }
}

export async function POST(request: Request) {
  const dbCheck = checkDatabase();
  if (dbCheck) return dbCheck;
  
  try {
    const data = await request.json();
    const customer = await prisma.customer.create({ data });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

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
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error, 'fetch products');
  }
}

export async function POST(request: Request) {
  const dbCheck = checkDatabase();
  if (dbCheck) return dbCheck;
  
  try {
    const data = await request.json();
    const product = await prisma.product.create({
      data: {
        ...data,
        sku: data.sku || `SKU-${Date.now()}`,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

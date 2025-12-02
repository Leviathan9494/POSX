import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const sale = await prisma.sale.create({
      data: {
        saleNumber: `SALE-${Date.now()}`,
        customerId: data.customerId,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount || 0,
        total: data.total,
        paymentMethod: data.paymentMethod,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax,
            total: item.total,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'out',
          quantity: item.quantity,
          reason: 'Sale',
        },
      });
    }

    // Update customer stats if customer exists
    if (data.customerId) {
      await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          totalSpent: {
            increment: data.total,
          },
          visitCount: {
            increment: 1,
          },
          lastVisit: new Date(),
        },
      });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Sale creation error:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from './prisma';

export function checkDatabase() {
  if (!prisma || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { 
        error: 'Database not configured', 
        message: 'Please add a PostgreSQL database in Vercel Storage and connect it to this project.' 
      }, 
      { status: 503 }
    );
  }
  return null;
}

export function handleApiError(error: unknown, operation: string) {
  console.error(`${operation} error:`, error);
  return NextResponse.json(
    { 
      error: `Failed to ${operation}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 
    { status: 500 }
  );
}

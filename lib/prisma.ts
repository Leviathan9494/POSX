import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Only create Prisma client if not in build phase
const createPrismaClient = () => {
  if (process.env.SKIP_ENV_VALIDATION === '1' || !process.env.DATABASE_URL) {
    return null;
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = (globalForPrisma.prisma || createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

// backend/src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

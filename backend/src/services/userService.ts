// backend/src/services/userService.ts
import { prisma } from '../config/prisma';

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: { name?: string }) {
  return prisma.user.update({
    where: { id },
    data: { name: data.name },
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });
}

export default { getUserById, updateUser };

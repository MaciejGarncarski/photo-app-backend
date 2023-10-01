import { Prisma } from '@prisma/client';

export const isPrismaError = (err: unknown) => {
  if (err && err instanceof Prisma.PrismaClientKnownRequestError) {
    return true;
  }
  return false;
};

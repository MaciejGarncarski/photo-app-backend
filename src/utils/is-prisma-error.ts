import { Prisma } from '@prisma/client';

export const isPrismaError = (err: unknown): err is Prisma.PrismaClientKnownRequestError => {
  if (err instanceof Error) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return true;
    }
  }
  return false;
};

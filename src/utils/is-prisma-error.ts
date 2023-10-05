import { Prisma } from '@prisma/client';

export const isPrismaError = (err: unknown) => {
  if (err instanceof Error) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return true;
    }
  }
  return false;
};

import { db } from '../prisma/db';

export const getNewestUsers = async (sessionUserId?: string) => {
  const users = await db.user.findMany({
    where: {
      NOT: {
        id: sessionUserId,
      },
    },
    take: 4,
    orderBy: {
      id: 'desc',
    },
  });

  return { users };
};

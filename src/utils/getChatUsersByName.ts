import { db } from '../prisma/db';
const CHAT_USERS_PER_REQUEST = 7;

export const getChatUsersByName = async (searchedUser: string, skip: number, sessionUserId: string) => {
  const condition = {
    OR: [{ username: { contains: searchedUser } }, { name: { contains: searchedUser } }],
    NOT: [{ id: sessionUserId }],
  };

  const users = await db.user.findMany({
    skip: skip * CHAT_USERS_PER_REQUEST,
    take: CHAT_USERS_PER_REQUEST,
    where: condition,
    orderBy: {
      id: 'desc',
    },
    include: {
      _count: {
        select: {
          posts: true,
          fromUser: true,
          toUser: true,
        },
      },
    },
  });

  const usersCount = await db.user.count({
    where: condition,
  });

  return { users, usersCount };
};

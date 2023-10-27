import { db } from './db.js';

const CHAT_USERS_PER_REQUEST = 7;

export const getChatUsers = async (skip: number, sessionUserId: string) => {
  const condition = {
    NOT: [{ id: sessionUserId }],
  };

  const users = await db.user.findMany({
    skip: skip * CHAT_USERS_PER_REQUEST,
    take: CHAT_USERS_PER_REQUEST,
    where: condition,
    include: {
      receivedMessages: {
        take: 1,
        where: {
          senderId: sessionUserId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      sentMessages: {
        where: {
          receiverId: sessionUserId,
        },
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
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

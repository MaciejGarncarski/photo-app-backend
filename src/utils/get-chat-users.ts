import { db } from './db.js';
import { CHAT_USERS_PER_REQUEST } from '../modules/chat/chat.service.js';

export const getChatUsers = async (skip: number, sessionUserId: string) => {
  const condition = {
    NOT: [{ userId: sessionUserId }],
  };

  const users = await db.user.findMany({
    skip: skip * CHAT_USERS_PER_REQUEST,
    take: CHAT_USERS_PER_REQUEST,
    where: {
      NOT: {
        userId: sessionUserId,
      },
    },
    orderBy: {
      receivedMessages: { _count: 'desc' },
    },
    select: {
      userId: true,
      receivedMessages: {
        select: {
          createdAt: true,
          text: true,
        },
        where: {
          senderId: sessionUserId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      sentMessages: {
        select: {
          createdAt: true,
          text: true,
        },
        where: {
          receiverId: sessionUserId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const usersCount = await db.user.count({
    where: condition,
  });

  return { users, usersCount };
};

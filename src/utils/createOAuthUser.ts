import { Token } from '@fastify/oauth2';
import { randomBytes } from 'crypto';

import { db } from './db.js';
import { mapPrismaUser } from './map-prisma-user.js';
import { GoogleUser } from '../modules/auth/auth.schema.js';

export const createOAuthUser = async (googleUserData: GoogleUser, token: Token) => {
  const temporaryUsername = 'user-' + randomBytes(3).toString('hex');
  const { id, picture, name } = googleUserData;

  try {
    const account = await db.account.findFirst({
      where: {
        providerAccountId: id,
      },
    });

    const user = await db.user.findFirst({
      where: {
        id: account?.userId,
      },
    });

    if (user && account) {
      const mappedUser = mapPrismaUser(user);
      return mappedUser;
    }

    const { expires_at } = token;
    const currentDate = new Date(expires_at);
    const expiresAt = Math.ceil(currentDate.getTime() / 1000);

    const createdUser = await db.user.create({
      data: {
        image: picture,
        name: name,
        username: temporaryUsername,
      },
    });

    if (!account) {
      await db.account.create({
        data: {
          userId: createdUser.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: id,
          expiresAt: expiresAt,
        },
        select: {
          user: true,
        },
      });
    }

    const mappedUser = mapPrismaUser(createdUser);
    return mappedUser;
  } catch (error) {
    return null;
  }
};

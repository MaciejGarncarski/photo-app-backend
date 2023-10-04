import { Token } from '@fastify/oauth2';

import { db } from './db.js';
import { GoogleUser } from '../modules/auth/auth.schema.js';

export const createOAuthUser = async ({ name, picture, id }: GoogleUser, token: Token) => {
  try {
    const account = await db.account.findFirst({
      where: {
        providerAccountId: id,
      },
    });

    if (account) {
      const user = await db.user.findFirst({
        where: {
          id: account.userId,
        },
      });

      return user;
    }

    const { expires_at } = token;

    const currentDate = new Date(expires_at);
    const expiresAt = Math.ceil(currentDate.getTime() / 1000);

    const createdUser = await db.user.create({
      data: {
        image: picture,
        name: name,
      },
    });

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

    return createdUser;
  } catch (error) {
    return null;
  }
};

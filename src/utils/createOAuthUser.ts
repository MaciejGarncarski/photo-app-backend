import { Token } from '@fastify/oauth2';

import { GoogleUser } from '../auth/auth.schema';
import { db } from '../prisma/db';

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
    const expiresAt = Math.floor(currentDate.getTime() / 1000);

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

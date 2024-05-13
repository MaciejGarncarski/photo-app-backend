import { Token } from '@fastify/oauth2';
import { hash } from 'argon2';
import ShortUniqueId from 'short-unique-id';

import { GoogleUser, RegisterValues } from '../auth/auth.schema.js';
import { User } from '../user/user.schema.js';
import { db } from '../../utils/db.js';
import { mapPrismaUser } from '../../utils/map-prisma-user.js';

export const registerUser = async ({ email, username, password }: RegisterValues) => {
  const hashedPassword = await hash(password);

  const createdUser = await db.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      avatarUrl: null,
    },
  });

  const mappedUser = {
    bio: createdUser.bio,
    createdAt: createdUser.createdAt.toString(),
    id: createdUser.userId,
    avatar: createdUser.avatarUrl,
    name: createdUser.name,
    username: createdUser.username || '',
  } satisfies User;

  return mappedUser;
};

export const createGoogleUser = async (googleUserData: GoogleUser, token: Token): Promise<User> => {
  const { id, picture, name } = googleUserData;

  const { expires_at } = token;
  const currentDate = new Date(expires_at);
  const expiresAt = Math.ceil(currentDate.getTime() / 1000);

  const { randomUUID } = new ShortUniqueId({ length: 6 });
  const temporaryUsername = `user${randomUUID().toUpperCase()}`;

  const account = await db.account.findFirst({
    where: {
      providerAccountId: id,
    },
  });

  const accountExists = Boolean(account);

  const createdUser = await db.user.create({
    data: {
      userId: account?.userId,
      name: name,
      username: temporaryUsername,
      avatarUrl: picture,
    },
  });

  if (!accountExists) {
    await db.account.create({
      data: {
        userId: createdUser.userId,
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
};

export const signInGoogle = async (googleId: string) => {
  try {
    const account = await db.account.findFirst({
      where: {
        providerAccountId: googleId,
      },
    });

    const user = await db.user.findUnique({
      where: {
        userId: account?.userId,
      },
    });

    if (user && account) {
      const mappedUser = mapPrismaUser(user);
      return mappedUser;
    }

    return null;
  } catch (error) {}
};

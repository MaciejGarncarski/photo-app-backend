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
      avatar: {
        create: {
          url: '',
        },
      },
    },
    include: {
      avatar: true,
    },
  });

  await db.userPreferences.create({
    data: {
      notificationSound: 'ON',
      theme: 'LIGHT',
      userId: createdUser.id,
    },
  });

  const mappedUser = {
    bio: createdUser.bio,
    createdAt: createdUser.createdAt.toString(),
    id: createdUser.id,
    avatar: createdUser.avatar?.url || null,
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
      id: account?.userId,
      name: name,
      username: temporaryUsername,
    },
  });

  const createAvatar = await db.avatar.create({
    data: {
      url: picture,
      userId: account?.userId,
    },
  });

  if (!accountExists) {
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

  const mappedUser = mapPrismaUser({ ...createdUser, avatar: createAvatar });
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
        id: account?.userId,
      },
      include: {
        avatar: true,
      },
    });

    if (user && account) {
      const mappedUser = mapPrismaUser(user);
      return mappedUser;
    }

    return null;
  } catch (error) {}
};

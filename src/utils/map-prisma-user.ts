import { User as PrismaUser } from '@prisma/client';

import { User } from '../modules/user/user.schema';

type PrismaUserWithAvatar = PrismaUser;

export const mapPrismaUser = (user: PrismaUserWithAvatar) => {
  const mappedUser = {
    bio: user.bio,
    createdAt: user.createdAt.toString(),
    id: user.userId,
    avatar: user.avatarUrl || null,
    name: user.name,
    username: user.username || '',
  } satisfies User;

  return mappedUser;
};

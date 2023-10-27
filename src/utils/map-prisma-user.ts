import { User as PrismaUser } from '@prisma/client';

import { User } from '../modules/user/user.schema';

type PrismaUserWithAvatar = PrismaUser & {
  avatar: {
    userId: string;
    url: string | null;
  } | null;
};

export const mapPrismaUser = (user: PrismaUserWithAvatar) => {
  const mappedUser = {
    bio: user.bio,
    createdAt: user.createdAt.toString(),
    id: user.id,
    avatar: user.avatar?.url || null,
    name: user.name,
    username: user.username || '',
  } satisfies User;

  return mappedUser;
};

import { User as PrismaUser } from '@prisma/client';

import { User } from '../modules/user/user.schema';

export const mapPrismaUser = (user: PrismaUser) => {
  const mappedUser = {
    bio: user.bio,
    createdAt: user.createdAt.toString(),
    customImage: user.customImage,
    id: user.id,
    image: user.image,
    name: user.name,
    username: user.username || '',
  } satisfies User;

  return mappedUser;
};

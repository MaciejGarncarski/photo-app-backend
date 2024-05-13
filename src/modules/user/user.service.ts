import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

import { EditAccountInput, UserWithStats } from './user.schema.js';
import { db } from '../../utils/db.js';
import { getCount } from '../../utils/getCount.js';
import { imageKit } from '../../utils/imagekit.js';

type Config =
  | {
      userId?: never;
      username: string;
    }
  | {
      username?: never;
      userId: string;
    };

export const getUser = async (config: Config, request: FastifyRequest) => {
  const sessionUser = request.session.data;

  const userData = await db.user.findFirst({
    where: config,
    select: {
      bio: true,
      createdAt: true,
      userId: true,
      avatarUrl: true,
      name: true,
      username: true,
      toUser: true,
    },
  });

  if (!userData) {
    return null;
  }

  const { bio, createdAt, avatarUrl, userId, name, username } = userData;

  const counts = await getCount(userId);

  const isFollowing =
    sessionUser &&
    sessionUser?.id !== userId &&
    Boolean(userData.toUser.find((follower) => follower.from === sessionUser.id));

  const user = {
    bio,
    createdAt: createdAt.toString(),
    ...counts,
    userId,
    avatar: avatarUrl,
    isFollowing: isFollowing || false,
    name,
    username: username || '',
  } satisfies UserWithStats;

  return user;
};

export const followUser = async (userId: string, sessionUserId: string) => {
  await db.follower.create({
    data: {
      from: sessionUserId,
      to: userId,
    },
    select: {
      createdAt: true,
      id: true,
    },
  });
};

export const unfollowUser = async (userId: string, sessionUserId: string) => {
  await db.follower.deleteMany({
    where: {
      from: sessionUserId,
      to: userId,
    },
  });
};

export const deleteAvatar = async (sessionUserId: string) => {
  await imageKit.deleteFolder(`${sessionUserId}/avatar/custom/`);

  return db.user.update({
    data: {
      avatarUrl: null,
    },
    where: {
      userId: sessionUserId,
    },
  });
};

export const editAccount = (sessionUserId: string, { bio, name, username }: EditAccountInput) => {
  return db.user.update({
    where: {
      userId: sessionUserId,
    },
    data: {
      bio,
      name,
      username,
    },
  });
};

export const updateAvatar = async (sessionUserId: string, fileData: MultipartFile) => {
  const folder = `${sessionUserId}/avatar/custom/`;

  const fileBuffer = await fileData.toBuffer();

  const image = await imageKit.upload({
    file: fileBuffer,
    fileName: `${sessionUserId}-custom-avatar`,
    folder,
  });

  const created = await db.user.update({
    data: {
      avatarUrl: image.url,
    },
    where: {
      userId: sessionUserId,
    },
  });

  return created;
};

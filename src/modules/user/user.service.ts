import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

import { EditAccountInput, UserPreferencesInput, UserWithStats } from './user.schema.js';
import { db } from '../../utils/db.js';
import { getCount } from '../../utils/getCount.js';
import { imageKit } from '../../utils/imagekit.js';

type Config =
  | {
      id?: never;
      username: string;
    }
  | {
      username?: never;
      id: string;
    };

export const getUser = async (config: Config, request: FastifyRequest) => {
  const sessionUser = request.session.data;

  const userData = await db.user.findFirst({
    where: config,
    select: {
      bio: true,
      createdAt: true,
      id: true,
      avatar: true,
      name: true,
      username: true,
      toUser: true,
    },
  });

  if (!userData) {
    return null;
  }

  const { bio, createdAt, avatar, id, name, username } = userData;

  const counts = await getCount(userData.id);

  const isFollowing =
    sessionUser &&
    sessionUser?.id !== userData.id &&
    Boolean(userData.toUser.find((follower) => follower.from === sessionUser.id));

  const user = {
    bio,
    createdAt: createdAt.toString(),
    ...counts,
    id,
    avatar: avatar?.url || null,
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

type UpdateUserPreferencesArguments = {
  data: UserPreferencesInput;
  userId?: string;
};

export const updateUserPreferences = ({ data, userId }: UpdateUserPreferencesArguments) => {
  if (!userId) {
    return null;
  }

  return db.userPreferences.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      theme: data.theme || 'LIGHT',
      notificationSound: data.notificationSound || 'ON',
    },
    update: {
      ...data,
    },
  });
};

export const deleteAvatar = async (sessionUserId: string) => {
  await imageKit.deleteFolder(`${sessionUserId}/avatar/custom/`);

  return db.avatar.upsert({
    create: {
      url: '',
      userId: sessionUserId,
    },
    update: {
      url: '',
      userId: sessionUserId,
    },
    where: {
      userId: sessionUserId,
    },
  });
};

export const editAccount = (sessionUserId: string, { bio, name, username }: EditAccountInput) => {
  return db.user.update({
    where: {
      id: sessionUserId,
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

  return db.avatar.upsert({
    create: {
      url: image.url,
      userId: sessionUserId,
    },
    update: {
      url: image.url,
      userId: sessionUserId,
    },
    where: {
      userId: sessionUserId,
    },
  });
};

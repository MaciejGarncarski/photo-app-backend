import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

import { EditAccountInput, User, UserPreferencesInput } from './user.schema.js';
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
      customImage: true,
      image: true,
      name: true,
      username: true,
      toUser: true,
    },
  });

  if (!userData) {
    return null;
  }

  const { bio, createdAt, customImage, id, image, name, username } = userData;

  const counts = await getCount(userData.id);

  const isFollowing =
    sessionUser &&
    sessionUser?.id !== userData.id &&
    Boolean(userData.toUser.find((follower) => follower.from === sessionUser.id));

  const user = {
    bio,
    createdAt: createdAt.toString(),
    customImage,
    ...counts,
    id,
    image,
    isFollowing: isFollowing || false,
    name,
    username: username || '',
  } satisfies User;

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

export const updateUserPreferences = async ({ data, userId }: UpdateUserPreferencesArguments) => {
  if (!userId) {
    return null;
  }

  await db.userPreferences.upsert({
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

  return 'ok';
};

export const deleteAvatar = async (sessionUserId: string) => {
  await imageKit.deleteFolder(`${sessionUserId}/avatar/custom/`);

  await db.user.update({
    data: {
      customImage: null,
    },
    where: {
      id: sessionUserId,
    },
  });
};

export const editAccount = async (sessionUserId: string, { bio, name, username }: EditAccountInput) => {
  await db.user.update({
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

  await db.user.update({
    where: {
      id: sessionUserId,
    },
    data: {
      customImage: image.url,
    },
  });
};

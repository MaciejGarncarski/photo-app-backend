import { FastifyRequest } from 'fastify';

import { GetUserPostsInput, User, UserPreferencesInput } from './user.schema';
import { PostDetails, PostsResponse } from '../post/post.schema';
import { db } from '../prisma/db';
import { getCount } from '../utils/getCount';
import { getServerSession } from '../utils/getServerSession';

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
  const { sessionUser } = await getServerSession(request);

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

const POSTS_PER_SCROLL = 6;

export const getUserPosts = async ({ skip, authorId }: GetUserPostsInput, request: FastifyRequest) => {
  const author = await getUser({ id: authorId }, request);
  const { sessionUser } = await getServerSession(request);

  if (!author) {
    return null;
  }

  const postsRequest = db.post.findMany({
    skip: skip * POSTS_PER_SCROLL,
    take: POSTS_PER_SCROLL,

    where: {
      authorId: authorId,
    },

    include: {
      images: true,
      postsLikes: {
        where: {
          userId: sessionUser?.id,
        },
      },
      _count: {
        select: {
          postsLikes: true,
          postsComments: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  const postsCountRequest = db.post.count({
    where: {
      authorId: authorId,
    },
  });

  const [postsCount, posts] = await Promise.all([postsCountRequest, postsRequest]);
  const maxPages = postsCount / POSTS_PER_SCROLL;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const transformedPosts = posts.map(({ _count, createdAt, description, images, id, postsLikes, authorId }) => {
    const transformedPost: PostDetails = {
      authorId,
      isLiked: Boolean(postsLikes[0]),
      id,
      commentsCount: _count.postsComments,
      likesCount: _count.postsLikes,
      images,
      createdAt: createdAt,
      description,
    };

    return transformedPost;
  });

  const response: PostsResponse = {
    postsCount,
    totalPages,
    currentPage: skip,
    posts: transformedPosts,
  };

  return response;
};

type UpdateUserPreferencesArguments = {
  data: UserPreferencesInput;
  userId?: string;
};

export const updateUserPreferences = async ({
  data: { notificationSound, theme },
  userId,
}: UpdateUserPreferencesArguments) => {
  if (!userId) {
    return null;
  }

  await db.userPreferences.upsert({
    where: {
      userId,
    },
    create: {
      notificationSound: notificationSound || 'ON',
      theme: theme || 'LIGHT',
      userId: userId,
    },
    update: {
      notificationSound,
      theme,
    },
  });

  return 'ok';
};

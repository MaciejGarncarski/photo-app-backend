import { FastifyRequest } from 'fastify';

import { GetUserPostsInput, User } from './user.schema';
import { Post, PostsResponse } from '../post/post.schema';
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
      created_at: true,
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

  const { bio, created_at, customImage, id, image, name, username } = userData;

  const counts = await getCount(userData.id);

  const isFollowing =
    sessionUser &&
    sessionUser?.id !== userData.id &&
    Boolean(userData.toUser.find((follower) => follower.from === sessionUser.id));

  const user = {
    bio,
    createdAt: created_at.toString(),
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
      created_at: true,
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

  const posts = await db.post.findMany({
    skip: skip * POSTS_PER_SCROLL,
    take: POSTS_PER_SCROLL,

    where: {
      author_id: authorId,
    },

    include: {
      images: true,
      posts_likes: {
        where: {
          user_id: sessionUser?.id,
        },
      },
      _count: {
        select: {
          posts_likes: true,
          posts_comments: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  const postsCount = await db.post.count({
    where: {
      author_id: authorId,
    },
  });

  const maxPages = postsCount / POSTS_PER_SCROLL;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const transformedPosts = posts.map(({ _count, created_at, description, images, id, posts_likes, author_id }) => {
    const transformedPost: Post = {
      authorId: author_id,
      isLiked: Boolean(posts_likes[0]),
      id,
      commentsCount: _count.posts_comments,
      likesCount: _count.posts_likes,
      images,
      createdAt: created_at,
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

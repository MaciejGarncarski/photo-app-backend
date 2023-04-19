import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { v4 } from 'uuid';

import { CreatePostInput, Post, PostsResponse } from './post.schema';
import { db } from '../prisma/db';
import { getServerSession } from '../utils/getServerSession';
import { imageKit } from '../utils/imagekit';

const POSTS_PER_SCROLL = 4;

export const getHomepagePosts = async (skip: number, request: FastifyRequest) => {
  const { sessionUser } = await getServerSession(request);

  const posts = await db.post.findMany({
    skip: skip * POSTS_PER_SCROLL,
    take: POSTS_PER_SCROLL,

    include: {
      author: true,
      images: true,
      posts_likes: {
        where: {
          user_id: sessionUser?.id || '',
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

  const postsCount = await db.post.count();
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

export const createPost = async (
  { description }: CreatePostInput,
  sessionUserId: string,
  images: Array<MultipartFile>,
) => {
  const post = await db.post.create({
    data: {
      author_id: sessionUserId,
      description,
    },
  });

  for await (const image of images) {
    const imageBuffer = await image.toBuffer();

    const { fileId, width, height, thumbnailUrl, url, size, name } = await imageKit.upload({
      file: imageBuffer,
      fileName: `${v4()}.webp`,
      folder: `post-images/${post.id}/`,
    });

    await db.postImage.create({
      data: {
        fileId,
        height,
        name,
        size,
        thumbnailUrl,
        url,
        width,
        postId: post.id,
      },
    });
  }
};

export const deletePost = async (postId: number, request: FastifyRequest) => {
  const { sessionUser } = await getServerSession(request);

  const postData = await db.post.findFirst({
    where: {
      id: postId,
    },
    select: { images: true, author_id: true },
  });

  if (!postData) {
    return;
  }
  const isAbleToDelete = postData.author_id === sessionUser?.id || sessionUser?.role === 'ADMIN';

  if (!isAbleToDelete) {
    return;
  }

  await imageKit.deleteFolder(`post-images/${postId}/`);
  await db.post.deleteMany({
    where: {
      id: postId,
    },
  });

  await db.postImage.deleteMany({
    where: {
      postId: postId,
    },
  });

  return 'deleted';
};

export const getPostById = async (postId: number, request: FastifyRequest) => {
  const { sessionUser } = await getServerSession(request);

  const postFromDb = await db.post.findFirst({
    where: {
      id: postId,
    },
    include: {
      author: true,
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
  });

  if (!postFromDb) {
    return null;
  }

  const {
    _count: { posts_comments: commentsCount, posts_likes: likesCount },
    author_id,
    created_at,
    description,
    id,
    images,
    posts_likes,
  } = postFromDb;

  const post: Post = {
    authorId: author_id,
    commentsCount,
    likesCount,
    createdAt: created_at,
    description,
    images,
    id,
    isLiked: Boolean(posts_likes[0]),
  };

  return post;
};

export const addPostLike = async (postId: number, sessionUserId: string) => {
  const likeAlreadyExists = await db.postLike.findFirst({
    where: {
      post_id: postId,
      user_id: sessionUserId,
    },
  });

  if (likeAlreadyExists) {
    return;
  }

  await db.postLike.create({
    data: {
      post_id: postId,
      user_id: sessionUserId,
    },
    select: {
      id: true,
    },
  });

  return 'ok';
};

export const deletePostLike = async (postId: number, sessionUserId: string) => {
  await db.postLike.deleteMany({
    where: {
      post_id: postId,
      user_id: sessionUserId,
    },
  });
};

export const editPost = async (postId: number, sessionUserId: string, newDescription: string) => {
  const postToBeEdited = await db.post.findFirst({
    where: {
      id: postId,
    },
  });

  if (postToBeEdited?.author_id !== sessionUserId) {
    return;
  }

  await db.post.update({
    data: {
      description: newDescription,
    },
    where: {
      id: postId,
    },
  });

  return 'ok';
};

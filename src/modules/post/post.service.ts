import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { v4 } from 'uuid';

import { CreatePostInput, GetUserPostsInput, PostDetails, PostsResponse } from './post.schema.js';
import { db } from '../../utils/db.js';
import { imageKit } from '../../utils/imagekit.js';

const POSTS_PER_SCROLL = 3;

export const getHomepagePosts = async (skip: number) => {
  const postsRequest = db.post.findMany({
    skip: skip * POSTS_PER_SCROLL,
    take: POSTS_PER_SCROLL,
    select: {
      authorId: true,
      createdAt: true,
      id: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const postsCountRequest = db.post.count();
  const [postsList, postsCount] = await Promise.all([postsRequest, postsCountRequest]);
  const maxPages = postsCount / POSTS_PER_SCROLL;
  const totalPages = Math.ceil(maxPages) - 1;

  const posts = postsList.map(({ authorId, createdAt, id }) => {
    return {
      id,
      createdAt: createdAt.toString(),
      authorId: authorId,
    };
  });

  const response: PostsResponse = {
    postsCount,
    totalPages,
    currentPage: skip,
    data: posts,
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
      authorId: sessionUserId,
      description,
    },
  });

  for await (const image of images) {
    const file = await image.toBuffer();

    const { fileId, width, height, thumbnailUrl, url, size, name } = await imageKit.upload({
      file: file,
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

  return post;
};

export const deletePost = async (postId: number, request: FastifyRequest) => {
  const sessionUser = request.session.data;

  const postData = await db.post.findFirst({
    where: {
      id: postId,
    },
    select: { images: true, authorId: true },
  });

  if (!postData) {
    return;
  }
  const isAbleToDelete = postData.authorId === sessionUser?.id;

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
  const sessionUser = request.session.data;

  const postFromDb = await db.post.findFirst({
    where: {
      id: postId,
    },
    include: {
      author: true,
      images: true,
      postsLikes: {
        where: sessionUser?.id
          ? {
              userId: sessionUser.id,
            }
          : {},
      },
      _count: {
        select: {
          postsLikes: true,
          postsComments: true,
        },
      },
    },
  });

  if (!postFromDb) {
    return null;
  }

  const {
    _count: { postsComments: commentsCount, postsLikes: likesCount },
    authorId,
    createdAt,
    description,
    id,
    images,
    postsLikes,
  } = postFromDb;

  const data: PostDetails = {
    authorId: authorId,
    commentsCount: commentsCount || 0,
    likesCount: likesCount || 0,
    createdAt: createdAt.toString(),
    description,
    images,
    id,
    isLiked: sessionUser ? Boolean(postsLikes[0]) : false,
  };

  return data;
};

export const addPostLike = async (postId: number, sessionUserId: string) => {
  const likeAlreadyExists = await db.postLike.findFirst({
    where: {
      postId: postId,
      userId: sessionUserId,
    },
  });

  if (likeAlreadyExists) {
    return;
  }

  return db.postLike.create({
    data: {
      postId: postId,
      userId: sessionUserId,
    },
    select: {
      id: true,
    },
  });
};

export const deletePostLike = async (postId: number, sessionUserId: string) => {
  await db.postLike.deleteMany({
    where: {
      postId: postId,
      userId: sessionUserId,
    },
  });
};

export const editPost = async (postId: number, sessionUserId: string, newDescription: string) => {
  const postToBeEdited = await db.post.findFirst({
    where: {
      id: postId,
    },
  });

  if (postToBeEdited?.authorId !== sessionUserId) {
    return;
  }

  return db.post.update({
    data: {
      description: newDescription,
    },
    where: {
      id: postId,
    },
  });
};

const USER_POSTS_PER_SCROLL = 3;

export const getUserPosts = async ({ skip, authorId }: GetUserPostsInput) => {
  const postsRequest = db.post.findMany({
    skip: skip * USER_POSTS_PER_SCROLL,
    take: USER_POSTS_PER_SCROLL,

    where: {
      authorId: authorId,
    },
    select: {
      id: true,
      createdAt: true,
      authorId: true,
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
  const totalPages = Math.ceil(postsCount / USER_POSTS_PER_SCROLL) - 1;

  const transformedPosts = posts.map((post) => {
    return {
      ...post,
      createdAt: post.createdAt.toString(),
    };
  });

  const response: PostsResponse = {
    postsCount,
    totalPages,
    currentPage: skip,
    data: transformedPosts,
  };

  return response;
};

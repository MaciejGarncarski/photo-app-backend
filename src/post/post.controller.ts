import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  DeletePostInput,
  EditPostInput,
  GetHomepagePostsInput,
  PostByIdInput,
  postDescriptionSchema,
  PostLikeInputSchema,
} from './post.schema';
import {
  addPostLike,
  createPost,
  deletePost,
  deletePostLike,
  editPost,
  getHomepagePosts,
  getPostById,
} from './post.service';
import { httpCodes } from '../consts/httpStatus';
import { getServerSession } from '../utils/getServerSession';

type RequestBody = { images: Array<MultipartFile> | MultipartFile; description: { value: string } };

export const getHomepagePostsHandler = async (
  request: FastifyRequest<{ Querystring: GetHomepagePostsInput }>,
  reply: FastifyReply,
) => {
  try {
    const postsData = await getHomepagePosts(parseInt(request.query.skip), request);
    return reply.code(httpCodes.SUCCESS).send(postsData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const createPostHandler = async (request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) => {
  const images = request.body.images;

  const result = postDescriptionSchema.safeParse(request.body.description.value);

  if (!result.success) {
    return reply.code(httpCodes.BAD_REQUEST).send('Invalid description provided.');
  }

  const description = result.data;

  const { sessionUser } = await getServerSession(request);

  if (!images) {
    return reply.code(httpCodes.BAD_REQUEST).send('no images provided');
  }

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    const imagesArray = Array.isArray(images) ? images : [images];
    await createPost({ description }, sessionUser.id, imagesArray);

    return reply.code(httpCodes.SUCCESS).send('created');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deletePostHandler = async (request: FastifyRequest<{ Params: DeletePostInput }>, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    const response = await deletePost(parseInt(request.params.postId), request);

    if (response === 'deleted') {
      return reply.code(httpCodes.SUCCESS).send('deleted');
    }

    return reply.code(httpCodes.BAD_REQUEST).send('cannot delete post');
  } catch (error) {}
};

export const getPostByIdHandler = async (request: FastifyRequest<{ Params: PostByIdInput }>, reply: FastifyReply) => {
  try {
    const postData = await getPostById(parseInt(request.params.postId), request);

    if (!postData) {
      return reply.code(httpCodes.NOT_FOUND).send('post not found');
    }

    return reply.code(httpCodes.SUCCESS).send(postData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const addPostLikeHandler = async (
  request: FastifyRequest<{ Params: PostLikeInputSchema }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    const response = await addPostLike(parseInt(request.params.postId), sessionUser.id);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send('like added');
    }

    return reply.code(httpCodes.BAD_REQUEST).send('post is already liked');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deletePostLikeHandler = async (
  request: FastifyRequest<{ Params: PostLikeInputSchema }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    await deletePostLike(parseInt(request.params.postId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send('like deleted');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const editPostHandler = async (request: FastifyRequest<{ Body: EditPostInput }>, reply: FastifyReply) => {
  const { description, postId } = request.body;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    const response = await editPost(parseInt(postId), sessionUser.id, description);
    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send('post edited');
    }

    return reply.code(httpCodes.FORBIDDEN).send('cannot edit post');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

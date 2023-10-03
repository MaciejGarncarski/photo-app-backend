import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  DeletePostInput,
  EditPostInput,
  GetHomepagePostsInput,
  GetUserPostsParamsInput,
  GetUserPostsQueryInput,
  PostByIdInput,
  postDescriptionSchema,
  PostLikeInputSchema,
} from './post.schema.js';
import {
  addPostLike,
  createPost,
  deletePost,
  deletePostLike,
  editPost,
  getHomepagePosts,
  getPostById,
  getUserPosts,
} from './post.service.js';
import { httpCodes } from '../../consts/httpStatus.js';
import { getServerSession } from '../../utils/getServerSession.js';

type RequestBody = { images: Array<MultipartFile> | MultipartFile; description: { value: string } };

export const getHomepagePostsHandler = async (
  request: FastifyRequest<{ Querystring: GetHomepagePostsInput }>,
  reply: FastifyReply,
) => {
  try {
    const postsData = await getHomepagePosts(parseInt(request.query.skip));

    return reply.code(httpCodes.SUCCESS).send(postsData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const getUserPostsHandler = async (
  request: FastifyRequest<{
    Querystring: GetUserPostsQueryInput;
    Params: GetUserPostsParamsInput;
  }>,
  reply: FastifyReply,
) => {
  const {
    query: { skip },
    params: { authorId },
  } = request;

  try {
    const response = await getUserPosts({ authorId, skip });

    if (!response) {
      return reply.code(httpCodes.NOT_FOUND).send({ status: 'Posts not found' });
    }

    return reply.code(httpCodes.SUCCESS).send(response);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const createPostHandler = async (request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) => {
  const images = request.body.images;

  const result = postDescriptionSchema.safeParse(request.body.description.value);

  if (!result.success) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'Invalid description provided.' });
  }

  const description = result.data;

  const { sessionUser } = await getServerSession(request);

  if (!images) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'no images provided' });
  }

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    const imagesArray = Array.isArray(images) ? images : [images];
    await createPost({ description }, sessionUser.id, imagesArray);
    request.server.io.emit('new post');

    return reply.code(httpCodes.SUCCESS).send({ status: 'created' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deletePostHandler = async (request: FastifyRequest<{ Params: DeletePostInput }>, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    const response = await deletePost(parseInt(request.params.postId), request);

    if (response === 'deleted') {
      return reply.code(httpCodes.SUCCESS).send({ status: 'deleted' });
    }

    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'cannot delete post' });
  } catch (error) {}
};

export const getPostByIdHandler = async (request: FastifyRequest<{ Params: PostByIdInput }>, reply: FastifyReply) => {
  try {
    const postData = await getPostById(parseInt(request.params.postId), request);

    if (!postData) {
      return reply.code(httpCodes.NOT_FOUND).send({ status: 'post not found' });
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
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    const response = await addPostLike(parseInt(request.params.postId), sessionUser.id);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send({ message: 'added' });
    }

    return reply.code(httpCodes.BAD_REQUEST).send({ message: 'already liked' });
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
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    await deletePostLike(parseInt(request.params.postId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ message: 'deleted' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const editPostHandler = async (request: FastifyRequest<{ Body: EditPostInput }>, reply: FastifyReply) => {
  const { description, postId } = request.body;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    const response = await editPost(parseInt(postId), sessionUser.id, description);
    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send({ status: 'post edited' });
    }

    return reply.code(httpCodes.FORBIDDEN).send({ status: 'cannot edit post' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

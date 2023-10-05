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

type RequestBody = { images: Array<MultipartFile> | MultipartFile; description: { value: string } };

export const getHomepagePostsHandler = async (
  request: FastifyRequest<{ Querystring: GetHomepagePostsInput }>,
  reply: FastifyReply,
) => {
  try {
    const postsData = await getHomepagePosts(parseInt(request.query.skip));

    return reply.send(postsData);
  } catch (error) {
    return reply.internalServerError(error as string);
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
      return reply.notFound('Posts not found.');
    }

    return response;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const createPostHandler = async (request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) => {
  const images = request.body.images;
  const { data: sessionData } = request.session;

  const result = postDescriptionSchema.safeParse(request.body.description.value);

  if (!result.success) {
    return reply.badRequest('Description parsing error');
  }

  const description = result.data;

  if (!images) {
    return reply.badRequest('No image provided');
  }

  try {
    const imagesArray = Array.isArray(images) ? images : [images];
    const data = await createPost({ description }, sessionData.id, imagesArray);
    request.server.io.emit('new post');

    return { data };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deletePostHandler = async (request: FastifyRequest<{ Params: DeletePostInput }>, reply: FastifyReply) => {
  try {
    const response = await deletePost(parseInt(request.params.postId), request);

    if (response === 'deleted') {
      return reply.status(204).send();
    }

    return reply.badRequest('Cannot delete post');
  } catch (error) {}
};

export const getPostByIdHandler = async (request: FastifyRequest<{ Params: PostByIdInput }>, reply: FastifyReply) => {
  try {
    const postData = await getPostById(parseInt(request.params.postId), request);

    if (!postData) {
      return reply.notFound('Post not found.');
    }

    return postData;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const addPostLikeHandler = async (
  request: FastifyRequest<{ Params: PostLikeInputSchema }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  try {
    const postLike = await addPostLike(parseInt(request.params.postId), data.id);
    return { postLike };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deletePostLikeHandler = async (
  request: FastifyRequest<{ Params: PostLikeInputSchema }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  try {
    await deletePostLike(parseInt(request.params.postId), data.id);
    return reply.status(204).send();
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const editPostHandler = async (request: FastifyRequest<{ Body: EditPostInput }>, reply: FastifyReply) => {
  const { description, postId } = request.body;
  const { data: sessionData } = request.session;

  try {
    const data = await editPost(parseInt(postId), sessionData.id, description);
    return { data };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

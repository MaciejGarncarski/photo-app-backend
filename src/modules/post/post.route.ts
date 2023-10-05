import { FastifyPluginAsync } from 'fastify';

import {
  addPostLikeHandler,
  createPostHandler,
  deletePostHandler,
  deletePostLikeHandler,
  editPostHandler,
  getHomepagePostsHandler,
  getPostByIdHandler,
  getUserPostsHandler,
} from './post.controller.js';
import { $ref } from './post.schema.js';
import { postCommentRoutesPlugin } from '../post-comment/post-comment.route.js';

export const postRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(postCommentRoutesPlugin);

  fastify.route({
    method: 'GET',
    url: '/post/homepage-posts',
    schema: {
      querystring: $ref('getHomepagePostsInputSchema'),
      response: {
        200: $ref('postsResponseSchema'),
      },
    },
    handler: getHomepagePostsHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/post/user/:authorId',
    schema: {
      params: $ref('getUserPostsParamsSchema'),
      querystring: $ref('getUserPostsQuerySchema'),
      response: {
        200: $ref('postsResponseSchema'),
      },
    },
    handler: getUserPostsHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/post',
    preHandler: [fastify.authorize],
    handler: createPostHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/post/edit',
    schema: { body: $ref('editPostInputSchema') },
    preHandler: [fastify.authorize],
    handler: editPostHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/:postId',
    schema: {
      params: $ref('deletePostInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: deletePostHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/post/:postId',
    schema: {
      params: $ref('postByIdInputSchema'),
      response: {
        200: $ref('postDetailsSchema'),
      },
    },
    handler: getPostByIdHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/post/:postId/like',
    preHandler: [fastify.authorize],
    handler: addPostLikeHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/:postId/like',
    preHandler: [fastify.authorize],
    handler: deletePostLikeHandler,
  });
};

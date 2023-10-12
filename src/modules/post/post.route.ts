import { Type } from '@sinclair/typebox';
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
import {
  deletePostInputSchema,
  editPostInputSchema,
  editPostParamsSchema,
  getHomepagePostsInputSchema,
  getUserPostsParamsSchema,
  getUserPostsQuerySchema,
  postByIdInputSchema,
  postDetailsSchema,
  postLikeInputSchema,
  postsResponseSchema,
} from './post.schema.js';
import { postCommentRoutesPlugin } from '../post-comment/post-comment.route.js';

export const postRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(postCommentRoutesPlugin);

  fastify.route({
    method: 'GET',
    url: '/posts',
    schema: {
      querystring: getHomepagePostsInputSchema,
      response: {
        200: postsResponseSchema,
      },
    },
    handler: getHomepagePostsHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/posts/user/:authorId',
    schema: {
      params: getUserPostsParamsSchema,
      querystring: getUserPostsQuerySchema,
      response: {
        200: postsResponseSchema,
      },
    },
    handler: getUserPostsHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/posts',
    preHandler: [fastify.authorize],

    handler: createPostHandler,
  });

  fastify.route({
    method: 'PUT',
    url: '/posts/:postId/edit',
    schema: {
      params: editPostParamsSchema,
      body: editPostInputSchema,
    },
    preHandler: [fastify.authorize],
    handler: editPostHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/posts/:postId',
    schema: {
      params: deletePostInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: deletePostHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/posts/:postId',
    schema: {
      params: postByIdInputSchema,
      response: {
        200: Type.Object({
          data: postDetailsSchema,
        }),
      },
    },
    handler: getPostByIdHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/posts/:postId/like',
    preHandler: [fastify.authorize],
    schema: {
      params: postLikeInputSchema,
    },
    handler: addPostLikeHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/posts/:postId/like',
    schema: {
      params: postLikeInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: deletePostLikeHandler,
  });
};

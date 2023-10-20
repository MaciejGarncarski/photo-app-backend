import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import {
  addCommentLikeHandler,
  addPostCommentHandler,
  deleteCommentLikeHandler,
  deletePostCommentHandler,
  getCommentsHandler,
} from './post-comment.controller.js';
import {
  addCommentResponseScema,
  addPostCommentInputSchema,
  commentLikeInputSchema,
  commentResponseSchema,
  deletePostCommentInputSchema,
  getPostCommentsInputSchema,
  getPostCommentsQuerySchema,
} from './post-comment.schema.js';

export const postCommentRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'POST',
    url: '/post/comment',
    schema: {
      body: addPostCommentInputSchema,
      response: {
        200: {
          data: addCommentResponseScema,
        },
      },
    },
    preHandler: [fastify.authorize],
    handler: addPostCommentHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/comment/:commentId',
    schema: {
      params: deletePostCommentInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: deletePostCommentHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/post/:postId/comments',
    schema: {
      params: getPostCommentsInputSchema,
      querystring: getPostCommentsQuerySchema,
      response: {
        200: Type.Object({
          data: commentResponseSchema,
        }),
      },
    },
    handler: getCommentsHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/post/comment/:commentId/like',
    schema: {
      params: commentLikeInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: addCommentLikeHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/comment/:commentId/like',
    schema: {
      params: commentLikeInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: deleteCommentLikeHandler,
  });
};

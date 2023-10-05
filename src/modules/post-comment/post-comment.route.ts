import { FastifyPluginAsync } from 'fastify';

import {
  addCommentLikeHandler,
  addPostCommentHandler,
  deleteCommentLikeHandler,
  deletePostCommentHandler,
  getCommentsHandler,
} from './post-comment.controller.js';
import { $ref } from './post-comment.schema.js';

export const postCommentRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'POST',
    url: '/post/comment',
    schema: {
      body: $ref('addPostCommentInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: addPostCommentHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/comment/:commentId',
    schema: {
      params: $ref('deletePostCommentInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: deletePostCommentHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/post/:postId/comments',
    schema: {
      params: $ref('getPostCommentsInputSchema'),
      querystring: $ref('getPostCommentsQuerySchema'),
      response: {
        200: $ref('commentResponseSchema'),
      },
    },
    handler: getCommentsHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/post/comment/:commentId/like',
    schema: {
      params: $ref('commentLikeInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: addCommentLikeHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/post/comment/:commentId/like',
    schema: {
      params: $ref('commentLikeInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: deleteCommentLikeHandler,
  });
};

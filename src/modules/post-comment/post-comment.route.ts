import { FastifyPluginAsync } from 'fastify';

import {
  addCommentLikeHandler,
  addPostCommentHandler,
  deleteCommentLikeHandler,
  deletePostCommentHandler,
  getCommentsHandler,
} from './post-comment.controller.js';
import { $ref } from './post-comment.schema.js';

export const postCommentRoutesPlugin: FastifyPluginAsync = async (server) => {
  server.route({
    method: 'POST',
    url: '/post/comment',
    schema: {
      body: $ref('addPostCommentInputSchema'),
    },
    handler: addPostCommentHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/post/comment/:commentId',
    schema: {
      params: $ref('deletePostCommentInputSchema'),
    },
    handler: deletePostCommentHandler,
  });

  server.route({
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

  server.route({
    method: 'POST',
    url: '/post/comment/:commentId/like',
    schema: {
      params: $ref('commentLikeInputSchema'),
    },
    handler: addCommentLikeHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/post/comment/:commentId/like',
    schema: {
      params: $ref('commentLikeInputSchema'),
    },
    handler: deleteCommentLikeHandler,
  });
};

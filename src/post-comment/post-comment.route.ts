import { FastifyInstance } from 'fastify';

import {
  addCommentLikeHandler,
  addPostCommentHandler,
  deleteCommentLikeHandler,
  deletePostCommentHandler,
  getCommentsHandler,
} from './post-comment.controller';
import { $ref } from './post-comment.schema';

export const postCommentRoutes = async (server: FastifyInstance) => {
  server.post(
    '/',
    {
      schema: {
        body: $ref('addPostCommentInputSchema'),
      },
    },
    addPostCommentHandler,
  );

  server.delete(
    '/:commentId',
    {
      schema: {
        params: $ref('deletePostCommentInputSchema'),
      },
    },
    deletePostCommentHandler,
  );
  server.get(
    '/:postId',
    {
      schema: {
        params: $ref('getPostCommentsInputSchema'),
        querystring: $ref('getPostCommentsQuerySchema'),
        response: {
          200: $ref('commentResponseSchema'),
        },
      },
    },
    getCommentsHandler,
  );
  server.put(
    '/:commentId/like',
    {
      schema: {
        params: $ref('commentLikeInputSchema'),
      },
    },
    addCommentLikeHandler,
  );
  server.delete(
    '/:commentId/like',
    {
      schema: {
        params: $ref('commentLikeInputSchema'),
      },
    },
    deleteCommentLikeHandler,
  );
};

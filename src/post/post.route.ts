import { FastifyInstance } from 'fastify';

import {
  addPostLikeHandler,
  createPostHandler,
  deletePostHandler,
  deletePostLikeHandler,
  editPostHandler,
  getHomepagePostsHandler,
  getPostByIdHandler,
} from './post.controller';
import { $ref } from './post.schema';

export const postRoutes = async (server: FastifyInstance) => {
  server.get(
    '/homepage-posts',
    {
      schema: {
        querystring: $ref('getHomepagePostsInputSchema'),
        response: {
          200: $ref('postsResponseSchema'),
        },
      },
    },
    getHomepagePostsHandler,
  );
  server.post('/create-post', createPostHandler);
  server.delete(
    '/:postId',
    {
      schema: {
        params: $ref('deletePostInputSchema'),
      },
    },
    deletePostHandler,
  );
  server.get(
    '/:postId',
    {
      schema: {
        params: $ref('postByIdInputSchema'),
        response: {
          200: $ref('postSchema'),
        },
      },
    },
    getPostByIdHandler,
  );
  server.post('/like/:postId', addPostLikeHandler);
  server.delete('/like/:postId', deletePostLikeHandler);
  server.post('/edit-post', { schema: { body: $ref('editPostInputSchema') } }, editPostHandler);
};

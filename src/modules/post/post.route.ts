import { FastifyInstance } from 'fastify';

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

export const postRoutesPlugin = async (server: FastifyInstance) => {
  server.register(postCommentRoutesPlugin);

  server.route({
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

  server.route({
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

  server.route({
    method: 'POST',
    url: '/post',
    handler: createPostHandler,
  });

  server.route({
    method: 'POST',
    url: '/post/edit',
    schema: { body: $ref('editPostInputSchema') },
    handler: editPostHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/post/:postId',
    schema: {
      params: $ref('deletePostInputSchema'),
    },
    handler: deletePostHandler,
  });

  server.route({
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

  server.route({
    method: 'POST',
    url: '/post/:postId/like',
    handler: addPostLikeHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/post/:postId/like',
    handler: deletePostLikeHandler,
  });
};

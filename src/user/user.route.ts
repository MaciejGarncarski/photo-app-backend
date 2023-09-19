import { FastifyInstance } from 'fastify';

import {
  followUserHandler,
  getUserByUsernameHandler,
  getUserHandler,
  getUserPostsHandler,
  unfollowUserHandler,
  updateUserPreferencesHandler,
} from './user.controller';
import { $ref } from './user.schema';

export const userRoutes = async (server: FastifyInstance) => {
  server.get(
    '/:userId',
    {
      schema: {
        params: $ref('getUserInputSchema'),
        response: {
          200: $ref('userSchema'),
        },
      },
    },
    getUserHandler,
  );
  server.get(
    '/username/:username',
    {
      schema: {
        params: $ref('getUserByUsernameInputSchema'),
        response: {
          200: $ref('userSchema'),
        },
      },
    },
    getUserByUsernameHandler,
  );
  server.get(
    '/posts/:authorId',
    {
      schema: {
        params: $ref('getUserPostsParamsSchema'),
        querystring: $ref('getUserPostsQuerySchema'),
        response: {
          200: $ref('postsResponseSchema'),
        },
      },
    },
    getUserPostsHandler,
  );
  server.put(
    '/follow/:userId',
    {
      schema: {
        params: $ref('followUserInputSchema'),
      },
    },
    followUserHandler,
  );
  server.delete(
    '/follow/:userId',
    {
      schema: {
        params: $ref('followUserInputSchema'),
      },
    },
    unfollowUserHandler,
  );
  server.post(
    '/preferences',
    {
      schema: {
        body: $ref('userPreferencesInputSchema'),
      },
    },
    updateUserPreferencesHandler,
  );
};

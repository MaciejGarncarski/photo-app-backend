import { FastifyInstance } from 'fastify';

import { getUserByUsernameHandler, getUserHandler } from './user.controller';
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
};

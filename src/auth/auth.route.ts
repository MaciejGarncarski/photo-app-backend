import { FastifyInstance } from 'fastify';

import {
  getCurrentUserHandler,
  registerCredentialsHandler,
  signInCredentialsHandler,
  signOutHandler,
} from './auth.controller';
import { $ref } from './auth.schema';

export const authRoutes = async (server: FastifyInstance) => {
  server.post(
    '/sign-in',
    {
      schema: {
        body: $ref('signInSchema'),
      },
    },
    signInCredentialsHandler,
  );
  server.post(
    '/register',
    {
      schema: {
        body: $ref('registerSchema'),
      },
    },
    registerCredentialsHandler,
  );

  server.get('/me', getCurrentUserHandler);
  server.delete('/me', signOutHandler);
};

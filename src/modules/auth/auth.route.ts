import { FastifyPluginAsync } from 'fastify';

import {
  getCurrentUserHandler,
  registerCredentialsHandler,
  signInCredentialsHandler,
  signOutHandler,
} from './auth.controller.js';
import { $ref } from './auth.schema.js';

export const authRoutesPlugin: FastifyPluginAsync = async (server) => {
  server.route({
    method: 'POST',
    handler: signInCredentialsHandler,
    schema: {
      body: $ref('signInSchema'),
    },
    url: '/auth/sign-in',
  });

  server.route({
    method: 'POST',
    handler: registerCredentialsHandler,
    schema: {
      body: $ref('registerSchema'),
    },
    url: '/auth/register',
  });

  server.route({
    method: 'GET',
    url: '/auth/me',
    handler: getCurrentUserHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/auth/me',
    handler: signOutHandler,
  });
};

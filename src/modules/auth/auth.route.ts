import { FastifyPluginAsync } from 'fastify';

import {
  getCurrentUserHandler,
  registerCredentialsHandler,
  signInCredentialsHandler,
  signOutHandler,
} from './auth.controller.js';
import { $ref } from './auth.schema.js';

export const authRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'POST',
    handler: signInCredentialsHandler,
    schema: {
      body: $ref('signInSchema'),
    },
    url: '/auth/sign-in',
  });

  fastify.route({
    method: 'POST',
    handler: registerCredentialsHandler,
    schema: {
      body: $ref('registerSchema'),
    },
    url: '/auth/register',
  });

  fastify.route({
    method: 'GET',
    url: '/auth/me',
    preHandler: [fastify.authorize],
    handler: getCurrentUserHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/auth/me',
    handler: signOutHandler,
  });
};

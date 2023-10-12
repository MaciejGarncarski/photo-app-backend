import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyPluginAsync } from 'fastify';

import {
  getCurrentUserHandler,
  registerCredentialsHandler,
  signInCredentialsHandler,
  signOutHandler,
} from './auth.controller.js';
import { registerSchema, signInSchema } from './auth.schema.js';
import { userSchema, userWithPreferencesSchema } from '../user/user.schema.js';

export const authRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: 'POST',
    handler: signInCredentialsHandler,
    schema: {
      body: signInSchema,
      response: {
        200: Type.Object({
          data: userSchema,
        }),
      },
    },
    url: '/auth/sign-in',
  });

  fastify.route({
    method: 'POST',
    handler: registerCredentialsHandler,
    schema: {
      body: registerSchema,
      response: {
        200: Type.Object({
          data: userSchema,
        }),
      },
    },
    url: '/auth/register',
  });

  fastify.route({
    method: 'GET',
    url: '/auth/me',
    schema: {
      response: {
        200: Type.Object({
          data: userWithPreferencesSchema,
        }),
      },
    },
    preHandler: [fastify.authorize],
    handler: getCurrentUserHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/auth/me',
    schema: {
      response: {
        204: {},
      },
    },
    handler: signOutHandler,
  });
};

import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import {
  deleteAvatarHandler,
  editAccountHandler,
  followUserHandler,
  getUserByUsernameHandler,
  getUserHandler,
  unfollowUserHandler,
  updateAvatarHandler,
} from './user.controller.js';
import {
  editAccountInputSchema,
  followUserInputSchema,
  getUserByUsernameInputSchema,
  getUserInputSchema,
  userWithStatsSchema,
} from './user.schema.js';

export const userRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'PUT',
    url: '/user/edit',
    schema: {
      body: editAccountInputSchema,
    },
    preHandler: [fastify.authorize],
    handler: editAccountHandler,
  });

  fastify.route({
    method: 'PUT',
    url: '/user/avatar',
    preHandler: [fastify.authorize],
    schema: {
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['image'],
        properties: {
          image: {
            isFile: true,
          },
        },
      },
    },
    handler: updateAvatarHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/user/avatar',
    preHandler: [fastify.authorize],
    schema: {
      response: {
        204: {},
      },
    },
    handler: deleteAvatarHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/user/:userId',
    schema: {
      params: getUserInputSchema,
      response: {
        200: Type.Object({
          data: userWithStatsSchema,
        }),
      },
    },
    handler: getUserHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/user/username/:username',
    schema: {
      params: getUserByUsernameInputSchema,
      response: {
        200: Type.Object({
          data: userWithStatsSchema,
        }),
      },
    },
    handler: getUserByUsernameHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/user/:userId/follow',
    schema: {
      params: followUserInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: followUserHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/user/:userId/follow',
    schema: {
      params: followUserInputSchema,
      response: {
        204: {},
      },
    },
    preHandler: [fastify.authorize],
    handler: unfollowUserHandler,
  });
};

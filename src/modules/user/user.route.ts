import { FastifyPluginAsync } from 'fastify';

import {
  deleteAvatarHandler,
  editAccountHandler,
  followUserHandler,
  getUserByUsernameHandler,
  getUserHandler,
  unfollowUserHandler,
  updateAvatarHandler,
  updateUserPreferencesHandler,
} from './user.controller.js';
import { $ref } from './user.schema.js';

export const userRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'POST',
    url: '/user/edit',
    schema: {
      body: $ref('editAccountInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: editAccountHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/user/avatar',
    preHandler: [fastify.authorize],
    handler: updateAvatarHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/user/avatar',
    preHandler: [fastify.authorize],
    handler: deleteAvatarHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/user/:userId',
    schema: {
      params: $ref('getUserInputSchema'),
      response: {
        200: $ref('userSchema'),
      },
    },
    handler: getUserHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/user/username/:username',
    schema: {
      params: $ref('getUserByUsernameInputSchema'),
      response: {
        200: $ref('userSchema'),
      },
    },
    handler: getUserByUsernameHandler,
  });

  fastify.route({
    method: 'PUT',
    url: '/user/:userId/follow',
    schema: {
      params: $ref('followUserInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: followUserHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/user/:userId/follow',
    schema: {
      params: $ref('followUserInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: unfollowUserHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/user/preferences',
    schema: {
      body: $ref('userPreferencesInputSchema'),
    },
    preHandler: [fastify.authorize],
    handler: updateUserPreferencesHandler,
  });
};

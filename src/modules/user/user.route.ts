import { FastifyInstance } from 'fastify';

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

export const userRoutesPlugin = async (server: FastifyInstance) => {
  server.route({
    method: 'POST',
    url: '/user/edit',
    schema: {
      body: $ref('editAccountInputSchema'),
    },
    handler: editAccountHandler,
  });

  server.route({
    method: 'POST',
    url: '/user/avatar',
    handler: updateAvatarHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/user/avatar',
    handler: deleteAvatarHandler,
  });

  server.route({
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

  server.route({
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

  server.route({
    method: 'PUT',
    url: '/user/:userId/follow',
    schema: {
      params: $ref('followUserInputSchema'),
    },
    handler: followUserHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/user/:userId/follow',
    schema: {
      params: $ref('followUserInputSchema'),
    },
    handler: unfollowUserHandler,
  });

  server.route({
    method: 'POST',
    url: '/user/preferences',
    schema: {
      body: $ref('userPreferencesInputSchema'),
    },
    handler: updateUserPreferencesHandler,
  });
};

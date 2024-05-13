import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import {
  chatRoomMessagesHandler,
  chatRoomUsersHandler,
  createChatRoomHandler,
  createMessageHandler,
  deleteMessageHandler,
} from './chat.controller.js';
import {
  chatMessagesParamsSchema,
  chatMessagesQuerySchema,
  chatMessagesResponseSchema,
  chatRoomInputSchema,
  chatRoomSchema,
  chatUsersQuerySchema,
  chatUsersResponseSchema,
  createMessageSchema,
  deleteMessageParamsSchema,
} from './chat.schema.js';

export const chatRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authorize);

  fastify.route({
    method: 'GET',
    schema: {
      params: chatRoomInputSchema,
      response: {
        200: Type.Object({
          data: chatRoomSchema,
        }),
      },
    },
    url: '/chat/check-user/:username',
    handler: createChatRoomHandler,
  });

  fastify.route({
    method: 'GET',
    schema: {
      params: chatMessagesParamsSchema,
      querystring: chatMessagesQuerySchema,
      response: {
        200: Type.Object({
          data: chatMessagesResponseSchema,
        }),
      },
    },
    url: '/chat/messages/:receiverId',
    handler: chatRoomMessagesHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/chat/users',
    schema: {
      querystring: chatUsersQuerySchema,
      response: {
        200: Type.Object({
          data: chatUsersResponseSchema,
        }),
      },
    },
    handler: chatRoomUsersHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/chat/message',
    schema: {
      body: createMessageSchema,
    },
    handler: createMessageHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/chat/message/:messageId',
    schema: {
      params: deleteMessageParamsSchema,
      response: {
        204: {},
      },
    },
    handler: deleteMessageHandler,
  });
};

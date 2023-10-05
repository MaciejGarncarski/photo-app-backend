import { FastifyPluginAsync } from 'fastify';

import {
  chatRoomMessagesHandler,
  chatRoomUsersHandler,
  createChatRoomHandler,
  createMessageHandler,
  deleteMessageHandler,
} from './chat.controller.js';
import { $ref } from './chat.schema.js';

export const chatRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authorize);

  fastify.route({
    method: 'GET',
    schema: { params: $ref('chatRoomInputSchema') },
    url: '/chat/check-user/:receiverId',
    handler: createChatRoomHandler,
  });

  fastify.route({
    method: 'GET',
    schema: {
      params: $ref('chatMessagesParamsSchema'),
      querystring: $ref('chatMessagesQuerySchema'),
      response: {
        200: $ref('chatMessagesResponseSchema'),
      },
    },
    url: '/chat/messages/:receiverId',
    handler: chatRoomMessagesHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/chat/users',
    schema: {
      querystring: $ref('chatUsersQuerySchema'),
      response: {
        200: $ref('chatUsersResponseSchema'),
      },
    },
    handler: chatRoomUsersHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/chat/message',
    schema: {
      body: $ref('createMessageSchema'),
    },
    handler: createMessageHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/chat/message/:messageId',
    schema: {
      params: $ref('deleteMessageParamsSchema'),
    },
    handler: deleteMessageHandler,
  });
};

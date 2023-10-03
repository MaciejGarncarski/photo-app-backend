import { FastifyPluginAsync } from 'fastify';

import {
  chatRoomMessagesHandler,
  chatRoomUsersHandler,
  createChatRoomHandler,
  createMessageHandler,
  deleteMessageHandler,
} from './chat.controller.js';
import { $ref } from './chat.schema.js';

export const chatRoutesPlugin: FastifyPluginAsync = async (server) => {
  server.route({
    method: 'GET',
    schema: { params: $ref('chatRoomInputSchema') },
    url: '/chat/check-user/:receiverId',
    handler: createChatRoomHandler,
  });

  server.route({
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

  server.route({
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

  server.route({
    method: 'POST',
    url: '/chat/message',
    schema: {
      body: $ref('createMessageSchema'),
    },
    handler: createMessageHandler,
  });

  server.route({
    method: 'DELETE',
    url: '/chat/message/:messageId',
    schema: {
      params: $ref('deleteMessageParamsSchema'),
    },
    handler: deleteMessageHandler,
  });
};

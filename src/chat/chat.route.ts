import { FastifyInstance } from 'fastify';

import {
  chatRoomMessagesHandler,
  chatRoomUsersHandler,
  createChatRoomHandler,
  deleteMessageHandler,
} from './chat.controller';
import { $ref } from './chat.schema';

export const chatRoutes = async (server: FastifyInstance) => {
  server.get('/:receiverId/check', { schema: { params: $ref('chatRoomInputSchema') } }, createChatRoomHandler);
  server.get(
    '/:receiverId/chatMessages',
    {
      schema: {
        params: $ref('chatMessagesParamsSchema'),
        querystring: $ref('chatMessagesQuerySchema'),
        response: {
          200: $ref('chatMessagesResponseSchema'),
        },
      },
    },
    chatRoomMessagesHandler,
  );
  server.get(
    '/chatUsers',
    {
      schema: {
        querystring: $ref('chatUsersQuerySchema'),
        response: {
          200: $ref('chatUsersResponseSchema'),
        },
      },
    },
    chatRoomUsersHandler,
  );
  server.delete(
    '/:messageId',
    {
      schema: {
        params: $ref('deleteMessageParamsSchema'),
      },
    },
    deleteMessageHandler,
  );
};

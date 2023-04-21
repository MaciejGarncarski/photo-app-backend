import { FastifyInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io';

import { createMessageSchema } from './chat.schema';
import { createMessage } from './chat.service';

export const chatPlugin = async (server: FastifyInstance) => {
  server.register(fastifyIO);
  server.ready((err) => {
    if (err) {
      throw err;
    }

    server.io.on('connection', (socket) => {
      socket.on('new post', () => {
        server.io.emit('new post');
      });

      socket.on('join chat room', async (arg) => {
        socket.join(`chatRoom-${arg.chatRoomId}`);
      });

      socket.on('send message', async (arg) => {
        const response = createMessageSchema.safeParse(arg);

        if (!response.success) {
          return;
        }

        const { receiverId, senderId, message } = response.data;

        try {
          const createdMessageRoom = await createMessage({ senderId, receiverId, message });

          if (createdMessageRoom) {
            server.io.to(createdMessageRoom.roomName).emit('new message', { senderId, receiverId });
          }
        } catch (error) {
          return null;
        }
      });
    });
  });
};

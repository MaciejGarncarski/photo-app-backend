import { FastifyInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io';

import { createMessageSchema } from './chat.schema';
import { createMessage } from './chat.service';

export const chatRoute = async (server: FastifyInstance) => {
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

        const { receiver, sender, message } = response.data;

        try {
          const { roomName } = await createMessage({ receiver, sender, message });
          server.io.to(roomName).emit('new message', { sender, receiver });
        } catch (error) {
          return null;
        }
      });
    });
  });
};

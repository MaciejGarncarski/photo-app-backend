import { FastifyInstance } from 'fastify';

export const chatPlugin = async (server: FastifyInstance) => {
  server.ready((err) => {
    if (err) {
      throw err;
    }

    server.io.on('connection', (socket) => {
      socket.on('join chat room', async (arg) => {
        socket.join(`chatRoom-${arg.chatRoomId}`);
      });
    });
  });
};

import { FastifyInstance } from 'fastify';

export const chatPlugin = async (server: FastifyInstance) => {
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
    });
  });
};

import { TypeBoxError } from '@fastify/type-provider-typebox';
import { Prisma } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import serverIo from 'fastify-socket.io';
import { Server } from 'socket.io';

import { authRoutesPlugin } from '../auth/auth.route.js';
import { googleAuthPlugin } from '../auth/googleAuth.plugin.js';
import { chatPlugin } from '../chat/chat.plugin.js';
import { chatRoutesPlugin } from '../chat/chat.route.js';
import { followerStatsRoutesPlugin } from '../follower-stats/follower-stats.route.js';
import { postRoutesPlugin } from '../post/post.route.js';
import { userRoutesPlugin } from '../user/user.route.js';

type NewMessage = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  chatroomId: number;
};

type ServerToClientEvents = {
  'new message': ({ senderId, receiverId, text }: NewMessage) => void;
  'new post': () => void;
};

type ClientToServerEvents = {
  'join chat room': (arg: { chatRoomId: number }) => void;
  'new post': () => void;
};

declare module 'fastify' {
  interface FastifyInstance {
    io: Server<ClientToServerEvents, ServerToClientEvents>;
  }
}

export const routerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/ping',
    handler: (_, rep) => {
      rep.code(200).send('pong');
    },
  });
  fastify.register(serverIo);
  fastify.register(authRoutesPlugin);
  fastify.register(followerStatsRoutesPlugin);
  fastify.register(postRoutesPlugin);
  fastify.register(userRoutesPlugin);
  fastify.register(chatRoutesPlugin);
  fastify.register(googleAuthPlugin);
  fastify.register(chatPlugin);

  const originalErrorHandler = fastify.errorHandler;

  fastify.setErrorHandler((error, req, rep) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return rep.internalServerError(`Something went wrong with Prisma. Error code: ${error.code}`);
    }

    if (error instanceof TypeBoxError) {
      return rep.internalServerError(`Something went wrong with parsing. Error code: ${error.code}`);
    }

    return originalErrorHandler(error, req, rep);
  });
};

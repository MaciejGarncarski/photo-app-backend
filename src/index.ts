import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';

const server = fastify();

const prisma = new PrismaClient();

server.register(cors, {
  origin: (origin, cb) => {
    const hostname = new URL(origin).hostname;
    if (
      hostname === 'photo-app-develop.vercel.app' ||
      hostname === 'photo-app-orpin.vercel.app' ||
      hostname === 'localhost'
    ) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed'), false);
  },
  methods: ['GET', 'POST'],
});

server.register(fastifyIO);

server.ready().then(() => {
  server.io.on('connection', (socket) => {
    socket.on('send message', async (arg) => {
      const { receiver, sender, message } = arg;

      try {
        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            OR: [
              {
                userOne_id: receiver,
                userTwo_id: sender,
              },
              {
                userOne_id: sender,
                userTwo_id: receiver,
              },
            ],
          },
        });

        const roomName = `chatRoom-${chatRoom?.id}`;
        socket.join(roomName);

        await prisma.message.create({
          data: {
            receiver,
            sender,
            text: message,
          },
          select: {
            created_at: true,
            id: true,
          },
        });
        server.io.to(roomName).emit('new message', { sender, receiver });
      } catch (error) {
        console.log({ error });
      }
    });
  });
});

const port = Number(process.env.PORT) || 3001;
server.listen({ port });

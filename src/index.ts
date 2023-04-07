import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastify from 'fastify';

import { chatRoute } from './chat/chat.route';
import { userRoutes } from './user/user.route';
import { userSchemas } from './user/user.schema';

const server = fastify();

server.register(cors);
server.register(fastifyCookie);

for (const schema of [...userSchemas]) {
  server.addSchema(schema);
}

server.register(chatRoute);
server.register(userRoutes, { prefix: 'api/users' });

const port = Number(process.env.PORT) || 3001;
server.listen({ port });

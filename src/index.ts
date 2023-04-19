import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { fastifySession, SessionStore } from '@fastify/session';
import fastify from 'fastify';
import ms from 'ms';

import { authRoutes } from './auth/auth.route';
import { chatRoute } from './chat/chat.route';
import { homeRoutes } from './home/home.route';
import { postRoutes } from './post/post.route';
import { postSchemas } from './post/post.schema';
import { postCommentRoutes } from './post-comment/post-comment.route';
import { postCommentSchemas } from './post-comment/post-comment.schema';
import { db } from './prisma/db';
import { sessionUserRoutes } from './session-user/session-user.route';
import { sessionUserSchemas } from './session-user/session-user.schema';
import { userRoutes } from './user/user.route';
import { userSchemas } from './user/user.schema';
import { PrismaStore } from './utils/PrismaStore';

const server = fastify();

for (const schema of [...userSchemas, ...sessionUserSchemas, ...postSchemas, ...postCommentSchemas]) {
  server.addSchema(schema);
}

server.register(cors, {
  credentials: true,
  origin: 'http://localhost:3000',
  methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
server.register(fastifyCookie);
server.register(fastifyMultipart, { attachFieldsToBody: true });

const sessionStore = new PrismaStore(db);
server.register(fastifySession, {
  secret: process.env.SECRET as string,
  store: sessionStore as SessionStore,
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: ms('7 days'),
    secure: false,
  },
});

server.register(userRoutes, { prefix: 'api/users' });
server.register(sessionUserRoutes, { prefix: 'api/session-user' });
server.register(authRoutes, { prefix: 'api/auth' });
server.register(postRoutes, { prefix: 'api/post' });
server.register(postCommentRoutes, { prefix: 'api/post-comment' });
server.register(homeRoutes, { prefix: 'api/home' });
server.register(chatRoute);

const port = Number(process.env.PORT) || 3001;
server.listen({ port });

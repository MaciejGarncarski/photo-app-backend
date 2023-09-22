import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { fastifySession, SessionStore } from '@fastify/session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import fastify from 'fastify';

import { authRoutes } from './auth/auth.route';
import { authSchemas } from './auth/auth.schema';
import { googleAuthPlugin } from './auth/googleAuth.plugin';
import { chatPlugin } from './chat/chat.plugin';
import { chatRoutes } from './chat/chat.route';
import { chatSchemas } from './chat/chat.schema';
import { cookie } from './consts/cookie';
import { followerStatsRoutes } from './follower-stats/follower-stats.route';
import { followersSchemas } from './follower-stats/follower-stats.schema';
import { postRoutes } from './post/post.route';
import { postSchemas } from './post/post.schema';
import { postCommentRoutes } from './post-comment/post-comment.route';
import { postCommentSchemas } from './post-comment/post-comment.schema';
import { sessionUserRoutes } from './session-user/session-user.route';
import { sessionUserSchemas } from './session-user/session-user.schema';
import { userRoutes } from './user/user.route';
import { userSchemas } from './user/user.schema';
import { envVariables } from './utils/envVariables';

const server = fastify();

for (const schema of [
  ...userSchemas,
  ...sessionUserSchemas,
  ...postSchemas,
  ...postCommentSchemas,
  ...followersSchemas,
  ...chatSchemas,
  ...authSchemas,
]) {
  server.addSchema(schema);
}

server.register(cors, {
  credentials: true,
  origin: `${envVariables.APP_URL}`,
  methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
server.register(fastifyCookie);
server.register(fastifyMultipart, { attachFieldsToBody: true });

const PrismaStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: 2 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

server.register(fastifySession, {
  secret: envVariables.SECRET,
  cookie,
  saveUninitialized: true,
  rolling: true,
  store: PrismaStore as SessionStore,
});

server.register(userRoutes, { prefix: 'api/users' });
server.register(sessionUserRoutes, { prefix: 'api/session-user' });
server.register(googleAuthPlugin);
server.register(authRoutes, { prefix: 'api/auth' });
server.register(postRoutes, { prefix: 'api/post' });
server.register(postCommentRoutes, { prefix: 'api/post-comment' });
server.register(followerStatsRoutes, { prefix: 'api/follower-stats' });
server.register(chatRoutes, { prefix: 'api/chat' });
server.get('/api/ping', (req, rep) => rep.code(200).send('pong'));
server.register(chatPlugin);

const port = parseInt(process.env.PORT || '3001');
server.listen({ port, host: '0.0.0.0' }, () => {
  console.log('App running on port: ', port);
});

import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { fastifySession, SessionStore } from '@fastify/session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import fastify from 'fastify';

import { cookie } from './consts/cookie.js';
import { authSchemas } from './modules/auth/auth.schema.js';
import { chatSchemas } from './modules/chat/chat.schema.js';
import { followersSchemas } from './modules/follower-stats/follower-stats.schema.js';
import { routerPlugin } from './modules/plugins/router.plugin.js';
import { postSchemas } from './modules/post/post.schema.js';
import { postCommentSchemas } from './modules/post-comment/post-comment.schema.js';
import { userSchemas } from './modules/user/user.schema.js';
import { envVariables } from './utils/envVariables.js';

const server = fastify();

const schemas = [userSchemas, postSchemas, postCommentSchemas, followersSchemas, chatSchemas, authSchemas].flat();

for (const schema of schemas) {
  server.addSchema(schema);
}

await server.register(cors, {
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
  cookie: cookie,
  saveUninitialized: true,
  rolling: true,
  store: PrismaStore as SessionStore,
});

server.register(routerPlugin, { prefix: '/' });

const port = parseInt(process.env.PORT || '3001');

server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('App running on port: ', port);
});

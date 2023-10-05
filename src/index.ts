import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySensible from '@fastify/sensible';
import { fastifySession, SessionStore } from '@fastify/session';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import fastify, { preHandlerHookHandler } from 'fastify';

import { cookie } from './consts/cookie.js';
import { authorize } from './middlewares/auth.middleware.js';
import { authSchemas } from './modules/auth/auth.schema.js';
import { chatSchemas } from './modules/chat/chat.schema.js';
import { followersSchemas } from './modules/follower-stats/follower-stats.schema.js';
import { routerPlugin } from './modules/plugins/router.plugin.js';
import { postSchemas } from './modules/post/post.schema.js';
import { postCommentSchemas } from './modules/post-comment/post-comment.schema.js';
import { userSchemas } from './modules/user/user.schema.js';
import { envVariables } from './utils/envVariables.js';

declare module 'fastify' {
  interface FastifyInstance {
    authorize: preHandlerHookHandler;
  }
}

const schemas = [userSchemas, postSchemas, postCommentSchemas, followersSchemas, chatSchemas, authSchemas].flat();
const PrismaStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: 2 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

const server = fastify();

for (const schema of schemas) {
  server.addSchema(schema);
}

await server.register(fastifySensible);
await server.register(fastifyCookie);
await server.register(fastifyMultipart, { attachFieldsToBody: true });
await server.register(cors, {
  credentials: true,
  origin: `${envVariables.APP_URL}`,
  methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

server.decorate('authorize', authorize);

await server.register(fastifySession, {
  secret: envVariables.SECRET,
  cookie: cookie,
  saveUninitialized: true,
  rolling: true,
  store: PrismaStore as SessionStore,
});
await server.register(routerPlugin, { prefix: '/' });

server.setErrorHandler((error, _, rep) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.log('prisma error');
    return server.httpErrors.notFound();
  }

  console.log('other error');
  return rep.send(error);
});

const port = parseInt(process.env.PORT || '3001');
server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('App running on port: ', port);
});

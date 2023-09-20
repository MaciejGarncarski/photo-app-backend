import { OAuth2Namespace } from '@fastify/oauth2';
import { User } from '@prisma/client';

declare module 'fastify' {
  interface Session {
    data: User | null;
  }
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

declare module '@fastify/secure-session' {
  interface SessionData {
    foo: string;
  }
}

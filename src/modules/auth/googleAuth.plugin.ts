import fastifyOauth2, { OAuth2Namespace } from '@fastify/oauth2';
import { User } from '@prisma/client';
import axios from 'axios';
import { FastifyInstance } from 'fastify';

import { googleUserSchema } from './auth.schema.js';
import { createOAuthUser } from '../../utils/createOAuthUser.js';
import { envVariables } from '../../utils/envVariables.js';

declare module 'fastify' {
  interface Session {
    data: User | null;
  }
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

export const googleAuthPlugin = async (server: FastifyInstance) => {
  await server.register(fastifyOauth2, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: envVariables.GOOGLE_CLIENT_ID,
        secret: envVariables.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    startRedirectPath: 'auth/google',
    callbackUri: `${envVariables.BACKEND_URL}/auth/google/callback`,
  });

  server.route({
    url: 'auth/google/callback',
    method: 'GET',
    async handler(request, reply) {
      const { token } = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      const googleAPiUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token.access_token}`;
      const { data } = await axios.get(googleAPiUrl);
      const response = googleUserSchema.safeParse(data);

      if (!response.success) {
        return reply.redirect(`${envVariables.APP_URL}/auth/signin`);
      }

      const user = await createOAuthUser(response.data, token);

      if (!user) {
        return reply.redirect(`${envVariables.APP_URL}/auth/signin`);
      }

      await request.session.regenerate();
      request.session.data = user;

      return reply.redirect(`${envVariables.APP_URL}`);
    },
  });
};

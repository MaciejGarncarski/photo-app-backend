import fastifyOauth2, { OAuth2Namespace } from '@fastify/oauth2';
import axios from 'axios';
import { FastifyInstance } from 'fastify';

import { GoogleUser } from './auth.schema.js';
import { createGoogleUser, signInGoogle } from './auth.service.js';
import { User } from '../user/user.schema.js';
import { envVariables } from '../../utils/envVariables.js';
import { retry } from '../../utils/retry.js';

declare module 'fastify' {
  interface Session {
    data: User;
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
    startRedirectPath: '/auth/google',
    callbackUri: `${envVariables.BACKEND_URL}/auth/google/callback`,
  });

  server.route({
    url: '/auth/google/callback',
    method: 'GET',
    async handler(request, reply) {
      const { token } = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      const googleAPiUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token.access_token}`;
      const response = await axios.get(googleAPiUrl);
      const data = response.data as GoogleUser;

      const user = await signInGoogle(data.id);

      if (user) {
        await request.session.regenerate();
        request.session.data = user;
        return reply.redirect(`${envVariables.APP_URL}`);
      }

      const createdUser = await retry<User>(() => createGoogleUser(data, token), {
        retries: 20,
      });

      if (createdUser) {
        await request.session.regenerate();
        request.session.data = createdUser;
        return reply.redirect(`${envVariables.APP_URL}`);
      }

      return reply.redirect(`${envVariables.APP_URL}/auth/sign-in`);
    },
  });
};

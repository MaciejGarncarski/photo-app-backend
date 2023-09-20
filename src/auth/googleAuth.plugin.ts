import fastifyOauth2 from '@fastify/oauth2';
import axios from 'axios';
import { FastifyInstance } from 'fastify';

import { googleUserSchema } from './auth.schema';
import { createOAuthUser } from '../utils/createOAuthUser';
import { envVariables } from '../utils/envVariables';

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
    startRedirectPath: '/api/auth/google',
    callbackUri: `${envVariables.BACKEND_URL}/api/auth/google/callback`,
  });

  server.route({
    url: '/api/auth/google/callback',
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

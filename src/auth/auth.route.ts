import { FastifyInstance } from 'fastify';

import { getCurrentUserHandler, signInCredentialsHandler, signOutHandler } from './auth.controller';

export const authRoutes = async (server: FastifyInstance) => {
  server.post('/login', signInCredentialsHandler);
  server.get('/me', getCurrentUserHandler);
  server.delete('/me', signOutHandler);
};

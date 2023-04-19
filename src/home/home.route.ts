import { FastifyInstance } from 'fastify';

import { getNewestUsersHandler } from './home.controller';

export const homeRoutes = async (server: FastifyInstance) => {
  server.get('/newest-users', getNewestUsersHandler);
};

import { FastifyInstance } from 'fastify';

import { getFollowersStatsHandler } from './follower-stats.controller';
import { $ref } from './follower-stats.schema';

export const followerStatsRoutes = async (server: FastifyInstance) => {
  server.get(
    '/follower',
    {
      schema: {
        querystring: $ref('followersInputSchema'),
        response: {
          200: $ref('followersResponseSchema'),
        },
      },
    },
    getFollowersStatsHandler,
  );
  server.get(
    '/friend',
    {
      schema: {
        querystring: $ref('followersInputSchema'),
        response: {
          200: $ref('followersResponseSchema'),
        },
      },
    },
    getFollowersStatsHandler,
  );
};

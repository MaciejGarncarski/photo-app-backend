import { FastifyInstance } from 'fastify';

import { getFollowersStatsHandler, getFriendsStatsHandler } from './follower-stats.controller';
import { $ref } from './follower-stats.schema';

export const followerStatsRoutes = async (server: FastifyInstance) => {
  server.get(
    '/followers',
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
    '/friends',
    {
      schema: {
        querystring: $ref('followersInputSchema'),
        response: {
          200: $ref('followersResponseSchema'),
        },
      },
    },
    getFriendsStatsHandler,
  );
};

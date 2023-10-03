import { FastifyPluginAsync } from 'fastify';

import { getFollowersStatsHandler, getFriendsStatsHandler } from './follower-stats.controller.js';
import { $ref } from './follower-stats.schema.js';

export const followerStatsRoutesPlugin: FastifyPluginAsync = async (server) => {
  server.route({
    method: 'GET',
    handler: getFollowersStatsHandler,
    schema: {
      querystring: $ref('followersInputSchema'),
      response: {
        200: $ref('followersResponseSchema'),
      },
    },
    url: '/follower-stats/followers',
  });

  server.route({
    method: 'GET',
    handler: getFriendsStatsHandler,
    schema: {
      querystring: $ref('followersInputSchema'),
      response: {
        200: $ref('followersResponseSchema'),
      },
    },
    url: '/follower-stats/friends',
  });
};
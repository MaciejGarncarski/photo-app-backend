import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { getFollowersStatsHandler, getFriendsStatsHandler } from './follower-stats.controller.js';
import { followersInputSchema, followersResponseSchema } from './follower-stats.schema.js';

export const followerStatsRoutesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    handler: getFollowersStatsHandler,
    schema: {
      querystring: followersInputSchema,
      response: {
        200: Type.Object({
          data: followersResponseSchema,
        }),
      },
    },
    url: '/follower-stats/followers',
  });

  fastify.route({
    method: 'GET',
    handler: getFriendsStatsHandler,
    schema: {
      querystring: followersInputSchema,
      response: {
        200: Type.Object({
          data: followersResponseSchema,
        }),
      },
    },
    url: '/follower-stats/friends',
  });
};

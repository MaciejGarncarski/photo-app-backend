import { FastifyRequest } from 'fastify';

import { FollowersInput } from './follower-stats.schema.js';
import { getFollowersStats, getFriendsStats } from './follower-stats.service.js';

export const getFollowersStatsHandler = async (request: FastifyRequest<{ Querystring: FollowersInput }>) => {
  const { skip, userId } = request.query;
  const sessionUserId = request.session.data?.id;

  const data = await getFollowersStats(userId, parseInt(skip), sessionUserId);

  return { data };
};

export const getFriendsStatsHandler = async (request: FastifyRequest<{ Querystring: FollowersInput }>) => {
  const { skip, userId } = request.query;
  const sessionUserId = request.session.data?.id;

  const data = await getFriendsStats(userId, parseInt(skip), sessionUserId);
  return { data };
};

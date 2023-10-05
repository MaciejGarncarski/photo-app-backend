import { FastifyReply, FastifyRequest } from 'fastify';

import { FollowersInput } from './follower-stats.schema.js';
import { getFollowersStats, getFriendsStats } from './follower-stats.service.js';

export const getFollowersStatsHandler = async (
  request: FastifyRequest<{ Querystring: FollowersInput }>,
  reply: FastifyReply,
) => {
  const { skip, userId } = request.query;
  const sessionUserId = request.session.data?.id;

  try {
    const users = await getFollowersStats(userId, parseInt(skip), sessionUserId);
    return users;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const getFriendsStatsHandler = async (
  request: FastifyRequest<{ Querystring: FollowersInput }>,
  reply: FastifyReply,
) => {
  const { skip, userId } = request.query;
  const sessionUserId = request.session.data?.id;

  try {
    const users = await getFriendsStats(userId, parseInt(skip), sessionUserId);
    return users;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

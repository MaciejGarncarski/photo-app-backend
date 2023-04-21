import { FastifyReply, FastifyRequest } from 'fastify';

import { FollowersInput } from './follower-stats.schema';
import { getFollowersStats } from './follower-stats.service';
import { httpCodes } from '../consts/httpStatus';

export const getFollowersStatsHandler = async (
  request: FastifyRequest<{ Querystring: FollowersInput }>,
  reply: FastifyReply,
) => {
  const { skip, userId } = request.query;
  const sessionUserId = request.session.user?.id;

  try {
    const users = await getFollowersStats(userId, parseInt(skip), sessionUserId);
    return reply.code(httpCodes.SUCCESS).send(users);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

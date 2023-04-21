import { FastifyReply, FastifyRequest } from 'fastify';

import { getNewestUsers } from './home.service';
import { httpCodes } from '../consts/httpStatus';
import { GetHomepagePostsInput } from '../post/post.schema';
import { getHomepagePosts } from '../post/post.service';
import { getServerSession } from '../utils/getServerSession';

export const getHomepagePostsHandler = async (
  request: FastifyRequest<{ Querystring: GetHomepagePostsInput }>,
  reply: FastifyReply,
) => {
  try {
    const postsData = await getHomepagePosts(parseInt(request.query.skip), request);
    return reply.code(httpCodes.SUCCESS).send(postsData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const getNewestUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  try {
    const { users } = await getNewestUsers(sessionUser?.id);
    return reply.code(httpCodes.SUCCESS).send(users);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

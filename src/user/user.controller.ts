import { FastifyReply, FastifyRequest } from 'fastify';

import {
  FollowUserInput,
  GetUserInput,
  GetUserInputByUsername,
  GetUserPostsParamsInput,
  GetUserPostsQueryInput,
  UserPreferencesInput,
} from './user.schema';
import { followUser, getUser, getUserPosts, unfollowUser, updateUserPreferences } from './user.service';
import { httpCodes } from '../consts/httpStatus';
import { getServerSession } from '../utils/getServerSession';

export const getUserHandler = async (
  request: FastifyRequest<{
    Params: GetUserInput;
  }>,
  reply: FastifyReply,
) => {
  const {
    params: { userId },
  } = request;

  try {
    const userData = await getUser({ id: userId }, request);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.NOT_FOUND).send({ status: 'User not found.' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const getUserByUsernameHandler = async (
  request: FastifyRequest<{
    Params: GetUserInputByUsername;
  }>,
  reply: FastifyReply,
) => {
  const {
    params: { username },
  } = request;

  try {
    const userData = await getUser({ username: username }, request);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.SERVER_ERROR).send({ status: 'Invalid user data' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const followUserHandler = async (request: FastifyRequest<{ Params: FollowUserInput }>, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    await followUser(request.params.userId, sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ status: 'success' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const unfollowUserHandler = async (
  request: FastifyRequest<{ Params: FollowUserInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    await unfollowUser(request.params.userId, sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ status: 'success' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const getUserPostsHandler = async (
  request: FastifyRequest<{
    Querystring: GetUserPostsQueryInput;
    Params: GetUserPostsParamsInput;
  }>,
  reply: FastifyReply,
) => {
  const {
    query: { skip },
    params: { authorId },
  } = request;

  try {
    const response = await getUserPosts({ authorId, skip }, request);

    if (!response) {
      return reply.code(httpCodes.NOT_FOUND).send({ status: 'Posts not found' });
    }

    return reply.code(httpCodes.SUCCESS).send(response);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const updateUserPreferencesHandler = async (
  request: FastifyRequest<{ Body: UserPreferencesInput }>,
  reply: FastifyReply,
) => {
  const sessionUserId = request.session.data?.id;

  try {
    const response = await updateUserPreferences({ data: request.body, userId: sessionUserId });

    if (response === 'ok') {
      reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
      return;
    }

    return reply.code(httpCodes.SERVER_ERROR).send({ status: 'cannot update' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

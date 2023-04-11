import { FastifyReply, FastifyRequest } from 'fastify';

import { GetUserInput, GetUserInputByUsername } from './user.schema';
import { getUser } from './user.service';
import { httpCodes } from '../consts/httpStatus';

export const getUserHandler = async (
  request: FastifyRequest<{
    Params: GetUserInput;
  }>,
  reply: FastifyReply,
) => {
  const {
    params: { userId, sessionUser },
  } = request;

  try {
    const userData = await getUser({ id: userId }, sessionUser);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.NOT_FOUND).send('User not found.');
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
    params: { username, sessionUser },
  } = request;

  try {
    const userData = await getUser({ username: username }, sessionUser);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.SERVER_ERROR).send('Invalid user data');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

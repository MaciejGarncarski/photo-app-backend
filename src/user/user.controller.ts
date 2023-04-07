import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';

import { GetUserInput, GetUserInputByUsername } from './user.schema';
import { getUser } from './user.service';
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
    const serverSession = await getServerSession(request);
    const userData = await getUser({ id: userId }, serverSession);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.SERVER_ERROR).send('Invalid user data');
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
    const serverSession = await getServerSession(request);
    console.log({ serverSession222: serverSession });
    const userData = await getUser({ username: username }, serverSession);

    if (userData) {
      return reply.code(httpCodes.SUCCESS).send(userData);
    }

    return reply.code(httpCodes.SERVER_ERROR).send('Invalid user data');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  EditAccountInput,
  FollowUserInput,
  GetUserInput,
  GetUserInputByUsername,
  UserPreferencesInput,
} from './user.schema.js';
import {
  deleteAvatar,
  editAccount,
  followUser,
  getUser,
  unfollowUser,
  updateAvatar,
  updateUserPreferences,
} from './user.service.js';
import { httpCodes } from '../../consts/httpStatus.js';
import { getServerSession } from '../../utils/getServerSession.js';

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

export const updateAvatarHandler = async (
  request: FastifyRequest<{ Body: { image: MultipartFile } }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  const fileData = request.body.image;

  if (!fileData) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'no image provided' });
  }

  try {
    await updateAvatar(sessionUser?.id, fileData);
    return reply.code(httpCodes.SUCCESS).send({ status: 'updated' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deleteAvatarHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    await deleteAvatar(sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ status: 'deleted' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const editAccountHandler = async (request: FastifyRequest<{ Body: EditAccountInput }>, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    await editAccount(sessionUser.id, request.body);
    return reply.code(httpCodes.SUCCESS).send({ status: 'success' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

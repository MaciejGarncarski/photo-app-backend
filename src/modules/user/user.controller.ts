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

export const getUserHandler = async (
  request: FastifyRequest<{
    Params: GetUserInput;
  }>,
  reply: FastifyReply,
) => {
  const {
    params: { userId },
  } = request;

  const userData = await getUser({ id: userId }, request);

  if (userData) {
    return userData;
  }

  return reply.notFound('User not found.');
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

  const userData = await getUser({ username: username }, request);

  if (userData) {
    return userData;
  }

  return reply.badRequest('Invalid user data.');
};

export const followUserHandler = async (request: FastifyRequest<{ Params: FollowUserInput }>, reply: FastifyReply) => {
  const { data } = request.session;

  try {
    await followUser(request.params.userId, data.id);
    return reply.status(204).send();
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const unfollowUserHandler = async (
  request: FastifyRequest<{ Params: FollowUserInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  try {
    await unfollowUser(request.params.userId, data.id);
    return reply.status(204).send();
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const updateUserPreferencesHandler = async (
  request: FastifyRequest<{ Body: UserPreferencesInput }>,
  reply: FastifyReply,
) => {
  const sessionUserId = request.session.data?.id;

  try {
    const data = await updateUserPreferences({ data: request.body, userId: sessionUserId });

    return { data };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const updateAvatarHandler = async (
  request: FastifyRequest<{ Body: { image: MultipartFile } }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  const fileData = request.body.image;

  if (!fileData) {
    return reply.badRequest('No image provided.');
  }

  try {
    await updateAvatar(data.id, fileData);
    return 'updated';
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deleteAvatarHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { data } = request.session;

  try {
    await deleteAvatar(data.id);
    return reply.status(204).send();
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const editAccountHandler = async (request: FastifyRequest<{ Body: EditAccountInput }>, reply: FastifyReply) => {
  const { data: sessionData } = request.session;

  try {
    const data = await editAccount(sessionData.id, request.body);
    return { data };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

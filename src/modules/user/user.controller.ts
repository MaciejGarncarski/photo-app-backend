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

  const data = await getUser({ id: userId }, request);

  if (data) {
    return { data };
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

  const data = await getUser({ username: username }, request);

  if (data) {
    return { data };
  }

  return reply.badRequest('Invalid user data.');
};

export const followUserHandler = async (request: FastifyRequest<{ Params: FollowUserInput }>, reply: FastifyReply) => {
  const { data } = request.session;

  await followUser(request.params.userId, data.id);
  return reply.status(204).send();
};

export const unfollowUserHandler = async (
  request: FastifyRequest<{ Params: FollowUserInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  await unfollowUser(request.params.userId, data.id);
  return reply.status(204).send();
};

export const updateUserPreferencesHandler = async (request: FastifyRequest<{ Body: UserPreferencesInput }>) => {
  const sessionUserId = request.session.data?.id;

  const data = await updateUserPreferences({ data: request.body, userId: sessionUserId });
  return { data };
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

  const updatedAvatar = await updateAvatar(data.id, fileData);
  return { data: updatedAvatar };
};

export const deleteAvatarHandler = async (request: FastifyRequest) => {
  const { data: sessionData } = request.session;

  const data = await deleteAvatar(sessionData.id);
  return { data };
};

export const editAccountHandler = async (request: FastifyRequest<{ Body: EditAccountInput }>) => {
  const { data: sessionData } = request.session;

  const data = await editAccount(sessionData.id, request.body);

  return { data };
};

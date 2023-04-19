import { MultipartFile } from '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';

import { EditAccountInput } from './session-user.schema';
import { deleteAvatar, editAccount, updateAvatar } from './session-user.service';
import { httpCodes } from '../consts/httpStatus';
import { getServerSession } from '../utils/getServerSession';

export const updateAvatarHandler = async (
  request: FastifyRequest<{ Body: { image: MultipartFile } }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  const fileData = request.body.image;

  if (!fileData) {
    return reply.code(httpCodes.BAD_REQUEST).send('no image provided');
  }

  try {
    await updateAvatar(sessionUser?.id, fileData);
    return reply.code(httpCodes.SUCCESS).send('updated');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deleteAvatarHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    await deleteAvatar(sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send('deleted');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const editAccountHandler = async (request: FastifyRequest<{ Body: EditAccountInput }>, reply: FastifyReply) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    await editAccount(sessionUser.id, request.body);
    return reply.code(httpCodes.SUCCESS).send('success');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

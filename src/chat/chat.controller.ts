import { FastifyReply, FastifyRequest } from 'fastify';

import {
  ChatMessagesParams,
  ChatMessagesQuery,
  ChatRoomInput,
  ChatUsersQuery,
  DeleteMessageParams,
} from './chat.schema';
import { chatMessages, chatUsers, createChatRoom, deleteMessage } from './chat.service';
import { httpCodes } from '../consts/httpStatus';
import { getServerSession } from '../utils/getServerSession';

export const createChatRoomHandler = async (
  request: FastifyRequest<{ Params: ChatRoomInput }>,
  reply: FastifyReply,
) => {
  const { receiverId } = request.params;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  if (sessionUser.id === receiverId) {
    return reply.code(httpCodes.BAD_REQUEST).send('invalid receiverId');
  }

  try {
    const chatRoom = await createChatRoom(receiverId, sessionUser.id);

    if (!chatRoom) {
      return reply.code(httpCodes.BAD_REQUEST).send('cannot find chat room');
    }

    return reply.code(httpCodes.SUCCESS).send(chatRoom);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const chatRoomMessagesHandler = async (
  request: FastifyRequest<{ Params: ChatMessagesParams; Querystring: ChatMessagesQuery }>,
  reply: FastifyReply,
) => {
  const { receiverId } = request.params;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  if (sessionUser.id === receiverId) {
    return reply.code(httpCodes.UNAUTHORIZED).send('invalid user');
  }

  try {
    const chatMessagesResponse = await chatMessages(sessionUser.id, receiverId, parseInt(request.query.skip));
    return reply.code(httpCodes.SUCCESS).send(chatMessagesResponse);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const chatRoomUsersHandler = async (
  request: FastifyRequest<{ Querystring: ChatUsersQuery }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);
  const skip = parseInt(request.query.skip);
  const { searchedUser } = request.query;

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    const chatUsersData = await chatUsers(sessionUser.id, searchedUser, skip);
    return reply.code(httpCodes.SUCCESS).send(chatUsersData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deleteMessageHandler = async (
  request: FastifyRequest<{ Params: DeleteMessageParams }>,
  reply: FastifyReply,
) => {
  const {
    params: { messageId },
  } = request;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    const response = await deleteMessage(sessionUser.id, messageId);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send('message deleted');
    }

    return reply.code(httpCodes.BAD_REQUEST).send('cannot delete message');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

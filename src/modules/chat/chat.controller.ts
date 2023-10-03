import { FastifyReply, FastifyRequest } from 'fastify';

import {
  ChatMessagesParams,
  ChatMessagesQuery,
  ChatRoomInput,
  ChatUsersQuery,
  CreateMessage,
  createMessageSchema,
  DeleteMessageParams,
} from './chat.schema.js';
import { chatMessages, chatUsers, createChatRoom, createMessage, deleteMessage } from './chat.service.js';
import { httpCodes } from '../../consts/httpStatus.js';
import { getServerSession } from '../../utils/getServerSession.js';

export const createChatRoomHandler = async (
  request: FastifyRequest<{ Params: ChatRoomInput }>,
  reply: FastifyReply,
) => {
  const { receiverId } = request.params;
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  if (sessionUser.id === receiverId) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'invalid receiverId' });
  }

  try {
    const chatRoom = await createChatRoom(receiverId, sessionUser.id);

    if (!chatRoom) {
      return reply.code(httpCodes.BAD_REQUEST).send({ status: 'cannot find chat room' });
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
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  if (sessionUser.id === receiverId) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'invalid user' });
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
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
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
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    const response = await deleteMessage(sessionUser.id, messageId);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send({ status: 'message deleted' });
    }

    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'cannot delete message' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const createMessageHandler = async (request: FastifyRequest<{ Body: CreateMessage }>, reply: FastifyReply) => {
  const response = createMessageSchema.safeParse(request.body);

  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  if (!response.success) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'invalid body data' });
  }

  if (response.data.senderId !== sessionUser.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  const { receiverId, senderId, message } = response.data;

  try {
    const createdMessageRoom = await createMessage({ senderId, receiverId, message });

    if (createdMessageRoom) {
      request.server.io.to(createdMessageRoom.roomName).emit('new message', { senderId, receiverId });
      reply.code(httpCodes.SUCCESS).send({ status: 'messge created' });
      return;
    }

    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'cannot send message' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

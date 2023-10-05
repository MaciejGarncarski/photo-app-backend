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

export const createChatRoomHandler = async (
  request: FastifyRequest<{ Params: ChatRoomInput }>,
  reply: FastifyReply,
) => {
  const { receiverId } = request.params;
  const { data } = request.session;

  if (data.id === receiverId) {
    return reply.badRequest('Receiver is sender.');
  }

  try {
    const chatRoom = await createChatRoom(receiverId, data.id);

    if (!chatRoom) {
      return reply.notFound('Chat room not found.');
    }

    return chatRoom;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const chatRoomMessagesHandler = async (
  request: FastifyRequest<{ Params: ChatMessagesParams; Querystring: ChatMessagesQuery }>,
  reply: FastifyReply,
) => {
  const { receiverId } = request.params;
  const { data } = request.session;

  if (data.id === receiverId) {
    return reply.badRequest('Receiver is sender.');
  }

  try {
    const chatMessagesResponse = await chatMessages(data.id, receiverId, parseInt(request.query.skip));
    return chatMessagesResponse;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const chatRoomUsersHandler = async (
  request: FastifyRequest<{ Querystring: ChatUsersQuery }>,
  reply: FastifyReply,
) => {
  const skip = parseInt(request.query.skip);
  const { searchedUser } = request.query;
  const { data } = request.session;

  try {
    const chatUsersData = await chatUsers(data.id, searchedUser, skip);
    return chatUsersData;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deleteMessageHandler = async (
  request: FastifyRequest<{ Params: DeleteMessageParams }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  const {
    params: { messageId },
  } = request;

  try {
    const response = await deleteMessage(data.id, messageId);

    if (response === 'ok') {
      return reply.status(204).send();
    }

    return reply.badRequest('Cannot delete message.');
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const createMessageHandler = async (request: FastifyRequest<{ Body: CreateMessage }>, reply: FastifyReply) => {
  const response = createMessageSchema.safeParse(request.body);

  if (!response.success) {
    return reply.badRequest('Invalid data');
  }

  const { receiverId, senderId, message } = response.data;

  try {
    const createdMessageRoom = await createMessage({ senderId, receiverId, message });

    if (createdMessageRoom) {
      request.server.io.to(createdMessageRoom.roomName).emit('new message', { senderId, receiverId });
      return 'message created';
    }

    return reply.badRequest('cannot send message');
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

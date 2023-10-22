import { FastifyReply, FastifyRequest } from 'fastify';

import {
  ChatMessagesParams,
  ChatMessagesQuery,
  ChatRoomInput,
  ChatUsersQuery,
  CreateMessage,
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

  const chatRoom = await createChatRoom(receiverId, data.id);

  if (!chatRoom) {
    return reply.notFound('Chat room not found.');
  }

  return { data: chatRoom };
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

  const chatMessagesResponse = await chatMessages(data.id, receiverId, parseInt(request.query.skip));
  return { data: chatMessagesResponse };
};

export const chatRoomUsersHandler = async (request: FastifyRequest<{ Querystring: ChatUsersQuery }>) => {
  const skip = parseInt(request.query.skip);
  const { data } = request.session;

  const chatUsersData = await chatUsers(data.id, skip);
  return { data: chatUsersData };
};

export const deleteMessageHandler = async (
  request: FastifyRequest<{ Params: DeleteMessageParams }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;

  const {
    params: { messageId },
  } = request;

  const response = await deleteMessage(data.id, messageId);

  if (response === 'ok') {
    return reply.status(204).send();
  }

  return reply.badRequest('Cannot delete message.');
};

export const createMessageHandler = async (request: FastifyRequest<{ Body: CreateMessage }>, reply: FastifyReply) => {
  const { receiverId, senderId, message } = request.body;

  const response = await createMessage({ senderId, receiverId, message });

  if (response) {
    request.server.io.to(response.roomName).emit('new message', response.createdMessage);
    return { status: 'ok' };
  }

  return reply.badRequest('cannot send message');
};

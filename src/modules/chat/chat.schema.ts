import { Static, Type } from '@fastify/type-provider-typebox';

import { Nullable } from '../../utils/nullable.js';

export const chatRoomInputSchema = Type.Object({
  username: Type.String(),
});

export type ChatRoomInput = Static<typeof chatRoomInputSchema>;

export const createMessageSchema = Type.Object({
  receiverId: Type.String(),
  senderId: Type.String(),
  message: Type.String(),
});

export type CreateMessage = Static<typeof createMessageSchema>;

export const chatMessagesParamsSchema = Type.Object({
  receiverId: Type.String(),
});

export const chatMessagesQuerySchema = Type.Object({
  skip: Type.String(),
});

export const chatUsersQuerySchema = Type.Object({
  skip: Type.String(),
});

export type ChatMessagesParams = Static<typeof chatMessagesParamsSchema>;
export type ChatMessagesQuery = Static<typeof chatMessagesQuerySchema>;
export type ChatUsersQuery = Static<typeof chatUsersQuerySchema>;

export const chatMessageSchema = Type.Object({
  senderId: Type.String(),
  receiverId: Type.String(),
  text: Type.String(),
  createdAt: Type.String(),
  id: Type.String(),
});

export type ChatMessage = Static<typeof chatMessageSchema>;

export const chatMessagesResponseSchema = Type.Object({
  messages: Type.Array(chatMessageSchema),
  totalPages: Type.Number(),
  currentPage: Type.Number(),
  messagesCount: Type.Number(),
});

export type ChatMessagesResponse = Static<typeof chatMessagesResponseSchema>;

export const chatUsersResponseSchema = Type.Object({
  users: Type.Array(
    Type.Object({
      userId: Type.String(),
      message: Type.String(),
      messageCreatedAt: Nullable(Type.String()),
    }),
  ),
  totalPages: Type.Number(),
  currentPage: Type.Number(),
  usersCount: Type.Number(),
});

export type ChatUsersResponse = Static<typeof chatUsersResponseSchema>;

export const deleteMessageParamsSchema = Type.Object({
  messageId: Type.String(),
});

export type DeleteMessageParams = Static<typeof deleteMessageParamsSchema>;

export const chatRoomSchema = Type.Object({
  id: Type.Number(),
  senderId: Type.String(),
  receiverId: Type.String(),
});

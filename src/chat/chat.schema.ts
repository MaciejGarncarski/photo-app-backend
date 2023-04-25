import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

import { User, userSchema } from '../user/user.schema';

const chatRoomInputSchema = z.object({
  receiverId: z.string(),
});

export type ChatRoomInput = z.infer<typeof chatRoomInputSchema>;

export const createMessageSchema = z.object({
  receiverId: z.string(),
  senderId: z.string(),
  message: z.string(),
});

export type CreateMessage = z.infer<typeof createMessageSchema>;

const chatMessagesParamsSchema = z.object({
  receiverId: z.string(),
});

const chatMessagesQuerySchema = z.object({
  skip: z.string(),
});

const chatUsersQuerySchema = z.object({
  skip: z.string(),
  searchedUser: z.string(),
});

export type ChatMessagesParams = z.infer<typeof chatMessagesParamsSchema>;
export type ChatMessagesQuery = z.infer<typeof chatMessagesQuerySchema>;
export type ChatUsersQuery = z.infer<typeof chatUsersQuerySchema>;

const chatMessageSchema = z.object({
  sender: z.custom<User>(),
  receiver: z.custom<User>(),
  senderId: z.string(),
  receiverId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  id: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

const chatMessagesResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  totalPages: z.number(),
  roundedMaxPages: z.number(),
  currentPage: z.number(),
  messagesCount: z.number(),
});

export type ChatMessagesResponse = z.infer<typeof chatMessagesResponseSchema>;

const chatUsersResponseSchema = z.object({
  users: z.array(userSchema),
  totalPages: z.number(),
  currentPage: z.number(),
  usersCount: z.number(),
});

export type ChatUsersResponse = z.infer<typeof chatUsersResponseSchema>;

const deleteMessageParamsSchema = z.object({
  messageId: z.string(),
});

export type DeleteMessageParams = z.infer<typeof deleteMessageParamsSchema>;

export const { $ref, schemas: chatSchemas } = buildJsonSchemas(
  {
    chatRoomInputSchema,
    chatMessagesQuerySchema,
    chatMessagesResponseSchema,
    chatMessagesParamsSchema,
    chatUsersQuerySchema,
    chatUsersResponseSchema,
    deleteMessageParamsSchema,
  },
  { $id: 'chatSchema' },
);

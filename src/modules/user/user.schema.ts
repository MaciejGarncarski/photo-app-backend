import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

import { postsResponseSchema } from '../post/post.schema.js';

const getUserInputSchema = z.object({
  userId: z.string(),
});

export const getUserByUsernameInputSchema = z.object({
  username: z.string(),
});

export type GetUserInput = z.infer<typeof getUserInputSchema>;
export type GetUserInputByUsername = z.infer<typeof getUserByUsernameInputSchema>;

export const userSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  id: z.string(),
  image: z.string().url().nullable(),
  customImage: z.string().url().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string(),
  postsCount: z.number(),
  followersCount: z.number(),
  friendsCount: z.number(),
  isFollowing: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

const followUserInputSchema = z.object({
  userId: z.string(),
});

export type FollowUserInput = z.infer<typeof followUserInputSchema>;

export const userPreferencesInputSchema = z.object({
  theme: z.optional(z.enum(['DARK', 'LIGHT'])),
  notificationSound: z.optional(z.enum(['ON', 'OFF'])),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesInputSchema>;

const editAccountInputSchema = z.object({
  username: z.string().nullish(),
  name: z.string().nullish(),
  bio: z.string().nullish(),
});

export type EditAccountInput = z.infer<typeof editAccountInputSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  getUserInputSchema,
  editAccountInputSchema,
  getUserByUsernameInputSchema,
  followUserInputSchema,
  userSchema,
  postsResponseSchema,
  userPreferencesInputSchema,
});

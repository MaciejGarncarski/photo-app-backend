import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

const getUserInputSchema = z.object({
  userId: z.string(),
  sessionUser: z.string().nullish(),
});

export const getUserByUsernameInputSchema = z.object({
  username: z.string(),
  sessionUser: z.string().nullish(),
});

export type GetUserInput = z.infer<typeof getUserInputSchema>;
export type GetUserInputByUsername = z.infer<typeof getUserByUsernameInputSchema>;

const userSchema = z.object({
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

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  getUserInputSchema,
  getUserByUsernameInputSchema,
  userSchema,
});

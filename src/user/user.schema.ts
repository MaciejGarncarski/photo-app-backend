import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

import { postsResponseSchema } from '../post/post.schema';

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

const getUserPostsParamsSchema = z.object({
  authorId: z.string(),
});

const getUserPostsQuerySchema = z.object({
  skip: z.string().transform((str) => parseInt(str)),
});

export type GetUserPostsParamsInput = z.infer<typeof getUserPostsParamsSchema>;
export type GetUserPostsQueryInput = z.infer<typeof getUserPostsQuerySchema>;

export type GetUserPostsInput = GetUserPostsQueryInput & GetUserPostsParamsInput;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  getUserInputSchema,
  getUserByUsernameInputSchema,
  followUserInputSchema,
  getUserPostsParamsSchema,
  getUserPostsQuerySchema,
  userSchema,
  postsResponseSchema,
});

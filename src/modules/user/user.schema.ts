import { Static, Type } from '@fastify/type-provider-typebox';

import { username } from '../auth/auth.schema.js';
import { Nullable } from '../../utils/nullable.js';

export const getUserInputSchema = Type.Object({
  userId: Type.String(),
});

export const getUserByUsernameInputSchema = Type.Object({
  username: Type.String(),
});

export const nameSchema = Type.String({ minLength: 1, maxLength: 10 });

export const userSchema = Type.Object({
  username: Type.String(),
  name: Nullable(Type.String()),
  id: Type.String(),
  avatar: Nullable(Type.String()),
  bio: Nullable(Type.String()),
  createdAt: Type.String(),
});

export const userWithStatsSchema = Type.Object({
  username: Type.String(),
  name: Nullable(Type.String()),
  userId: Type.String(),
  avatar: Nullable(Type.String()),
  bio: Nullable(Type.String()),
  createdAt: Type.String(),
  postsCount: Type.Number(),
  followersCount: Type.Number(),
  friendsCount: Type.Number(),
  isFollowing: Type.Boolean(),
});

export const followUserInputSchema = Type.Object({
  userId: Type.String(),
});

export const editAccountInputSchema = Type.Object({
  username: Nullable(username),
  name: Nullable(nameSchema),
  bio: Nullable(Type.String()),
});

export type User = Static<typeof userSchema>;
export type UserWithStats = Static<typeof userWithStatsSchema>;
export type EditAccountInput = Static<typeof editAccountInputSchema>;
export type FollowUserInput = Static<typeof followUserInputSchema>;
export type GetUserInput = Static<typeof getUserInputSchema>;
export type GetUserInputByUsername = Static<typeof getUserByUsernameInputSchema>;

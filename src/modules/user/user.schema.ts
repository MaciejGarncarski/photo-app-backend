import { Static, Type } from '@fastify/type-provider-typebox';

import { Nullable } from '../../utils/nullable.js';
import { username } from '../auth/auth.schema.js';

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
  image: Nullable(Type.String({ format: 'uri' })),
  customImage: Nullable(Type.String({ format: 'uri' })),
  bio: Nullable(Type.String()),
  createdAt: Type.String(),
});

export const userWithStatsSchema = Type.Object({
  username: Type.String(),
  name: Nullable(Type.String()),
  id: Type.String(),
  image: Nullable(Type.String({ format: 'uri' })),
  customImage: Nullable(Type.String({ format: 'uri' })),
  bio: Nullable(Type.String()),
  createdAt: Type.String(),
  postsCount: Type.Number(),
  followersCount: Type.Number(),
  friendsCount: Type.Number(),
  isFollowing: Type.Boolean(),
});

const themeUnion = Type.Union([Type.Literal('LIGHT'), Type.Literal('DARK')]);
const notificationSoundUnion = Type.Union([Type.Literal('ON'), Type.Literal('OFF')]);

export const userWithPreferencesSchema = Type.Object({
  username: Type.String(),
  name: Nullable(Type.String()),
  id: Type.String(),
  image: Nullable(Type.String({ format: 'uri' })),
  customImage: Nullable(Type.String({ format: 'uri' })),
  bio: Nullable(Type.String()),
  createdAt: Type.String(),
  theme: themeUnion,
  notificationSound: notificationSoundUnion,
});

export const followUserInputSchema = Type.Object({
  userId: Type.String(),
});

export const userPreferencesInputSchema = Type.Object({
  theme: Type.Optional(themeUnion),
  notificationSound: Type.Optional(notificationSoundUnion),
});

export const editAccountInputSchema = Type.Object({
  username: Nullable(username),
  name: Nullable(nameSchema),
  bio: Nullable(Type.String()),
});

export type User = Static<typeof userSchema>;
export type UserWithStats = Static<typeof userWithStatsSchema>;
export type UserWithPreferences = Static<typeof userWithPreferencesSchema>;
export type UserPreferencesInput = Static<typeof userPreferencesInputSchema>;
export type EditAccountInput = Static<typeof editAccountInputSchema>;
export type FollowUserInput = Static<typeof followUserInputSchema>;
export type GetUserInput = Static<typeof getUserInputSchema>;
export type GetUserInputByUsername = Static<typeof getUserByUsernameInputSchema>;

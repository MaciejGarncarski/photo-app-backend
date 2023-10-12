import { Static, Type } from '@fastify/type-provider-typebox';

export const followersInputSchema = Type.Object({
  userId: Type.String(),
  skip: Type.String(),
});

export type FollowersInput = Static<typeof followersInputSchema>;

export const followersResponseSchema = Type.Object({
  users: Type.Array(Type.String()),
  totalPages: Type.Number(),
  currentPage: Type.Number(),
  usersCount: Type.Number(),
});

export type FollowersResponse = Static<typeof followersResponseSchema>;

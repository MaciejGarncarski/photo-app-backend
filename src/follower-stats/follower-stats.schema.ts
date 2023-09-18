import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

const followersInputSchema = z.object({
  userId: z.string(),
  skip: z.string(),
});

export type FollowersInput = z.infer<typeof followersInputSchema>;

const followersResponseSchema = z.object({
  users: z.array(z.string()),
  totalPages: z.number(),
  roundedMaxPages: z.number(),
  currentPage: z.number(),
  usersCount: z.number(),
});

export type FollowersResponse = z.infer<typeof followersResponseSchema>;

export const { schemas: followersSchemas, $ref } = buildJsonSchemas(
  {
    followersResponseSchema,
    followersInputSchema,
  },
  { $id: 'followersSchema' },
);

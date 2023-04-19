import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas({
  signInSchema,
});

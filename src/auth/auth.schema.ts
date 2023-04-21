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

export const googleUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string(),
  picture: z.string(),
  locale: z.string(),
});

export type GoogleUser = z.infer<typeof googleUserSchema>;

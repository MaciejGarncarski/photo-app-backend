import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInValues = z.infer<typeof signInSchema>;

const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim;
const smallCharactersRegexp = /^[a-z0-9_\-]+$/;

export const username = z
  .string()
  .min(4, { message: 'Username must contain at least 4 characters.' })
  .regex(usernameRegex, { message: 'Invalid username' })
  .regex(smallCharactersRegexp, {
    message: 'Only lowercase characters allowed.',
  })
  .max(9, { message: 'Only 9 characters allowed.' })
  .optional();

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email.' }),
  username: username,
  password: z.string().min(5, { message: 'Password is too short.' }),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const { $ref, schemas: authSchemas } = buildJsonSchemas(
  {
    signInSchema,
    registerSchema,
  },
  { $id: 'authSchema' },
);

export const googleUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string(),
  picture: z.string(),
  locale: z.string(),
});

export type GoogleUser = z.infer<typeof googleUserSchema>;

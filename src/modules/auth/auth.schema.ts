import { Static, Type } from '@fastify/type-provider-typebox';

export const signInSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export type SignInValues = Static<typeof signInSchema>;

const usernameRegExp = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim;
const smallCharactersRegExp = /^[a-z0-9_\-]+$/;

export const username = Type.Optional(Type.Union([Type.RegExp(usernameRegExp), Type.RegExp(smallCharactersRegExp)]));

export const registerSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  username: username,
  password: Type.String({ minLength: 5 }),
  confirmPassword: Type.String({ minLength: 5 }),
});

export type RegisterValues = Static<typeof registerSchema>;

export const googleUserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  given_name: Type.String(),
  picture: Type.String(),
  locale: Type.String(),
});

export type GoogleUser = Static<typeof googleUserSchema>;

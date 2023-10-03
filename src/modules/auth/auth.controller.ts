import { verify } from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';

import { RegisterValues, SignInValues } from './auth.schema.js';
import { registerUser } from './auth.service.js';
import { db } from '../../utils/db.js';

export const signInCredentialsHandler = async (
  request: FastifyRequest<{
    Body: SignInValues;
  }>,
  reply: FastifyReply,
) => {
  const { email, password } = request.body;

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return reply.notFound('User not found');
  }

  try {
    const isPasswordEqual = await verify(user?.password || '', password);
    if (!isPasswordEqual) {
      return reply.badRequest('Passwords do not match');
    }
    request.session.data = user;
    return { status: 'ok' };
  } catch (error) {
    return reply.badRequest('Passwords do not match');
  }
};

export const registerCredentialsHandler = async (
  request: FastifyRequest<{
    Body: RegisterValues;
  }>,
  reply: FastifyReply,
) => {
  const data = request.body;

  if (data.password !== data.confirmPassword) {
    return reply.badRequest('Passwords do not match');
  }

  const emailTaken = Boolean(
    await db.user.count({
      where: {
        email: data.email,
      },
    }),
  );

  if (emailTaken) {
    return reply.badRequest('Email is already taken.');
  }

  const usernameTaken = Boolean(
    await db.user.count({
      where: {
        username: data.username,
      },
    }),
  );

  if (usernameTaken) {
    return reply.badRequest('Username is already taken.');
  }

  try {
    const registeredUser = await registerUser(data);
    request.session.data = registeredUser;

    return 'ok';
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const getCurrentUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session.data) {
    return reply.unauthorized('Not signed in.');
  }

  const userPreferences = await db.userPreferences.findFirst({
    where: {
      userId: request.session.data.id,
    },
    select: {
      notificationSound: true,
      theme: true,
    },
  });

  const userWithPreferences = { ...userPreferences, ...request.session.data };
  return userWithPreferences;
};

export const signOutHandler = async (request: FastifyRequest) => {
  await request.session.destroy();
  return { status: 'signed out.' };
};

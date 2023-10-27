import { verify } from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';

import { RegisterValues, SignInValues } from './auth.schema.js';
import { registerUser } from './auth.service.js';
import { UserWithPreferences } from '../user/user.schema.js';
import { db } from '../../utils/db.js';
import { mapPrismaUser } from '../../utils/map-prisma-user.js';

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
    include: {
      avatar: true,
    },
  });

  if (!user) {
    return reply.notFound('Invalid credentials.');
  }

  const isPasswordEqual = await verify(user?.password || '', password);

  if (!isPasswordEqual) {
    return reply.badRequest('Invalid credentials.');
  }

  const mappedUser = mapPrismaUser(user);
  request.session.data = mappedUser;
  return { data: mappedUser };
};

export const registerCredentialsHandler = async (
  request: FastifyRequest<{
    Body: RegisterValues;
  }>,
  reply: FastifyReply,
) => {
  const data = request.body;

  if (data.password !== data.confirmPassword) {
    return reply.badRequest('Passwords do not match.');
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

  const registeredUser = await registerUser(data);
  request.session.data = registeredUser;

  return reply.status(201).send({ data: registerUser });
};

export const getCurrentUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { data } = request.session;

  const userData = await db.user.findUnique({
    where: {
      id: data?.id,
    },
    include: {
      avatar: true,
    },
  });

  if (!userData) {
    return reply.notFound('User not found.');
  }

  const userPreferences = await db.userPreferences.findFirst({
    where: {
      userId: data?.id,
    },
    select: {
      notificationSound: true,
      theme: true,
    },
  });

  const mappedUser = mapPrismaUser(userData);

  const userWithPreferences: UserWithPreferences = {
    ...mappedUser,
    notificationSound: userPreferences?.notificationSound || 'ON',
    theme: userPreferences?.theme || 'LIGHT',
  };

  return { data: userWithPreferences };
};

export const signOutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await request.session.destroy();
  return reply.status(204).send();
};

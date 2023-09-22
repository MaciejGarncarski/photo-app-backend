import { verify } from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';

import { RegisterValues, SignInValues } from './auth.schema';
import { registerUser } from './auth.service';
import { httpCodes } from '../consts/httpStatus';
import { db } from '../prisma/db';

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
    return reply.status(httpCodes.NOT_FOUND).send({ status: 'error', message: 'User not found.' });
  }

  try {
    const isPasswordEqual = await verify(user?.password || '', password);
    if (!isPasswordEqual) {
      return reply.status(httpCodes.FORBIDDEN).send({ status: 'error', message: 'Passwords do not match.' });
    }

    request.session.data = user;
    return reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
  } catch (error) {
    return reply.status(httpCodes.FORBIDDEN).send({ status: 'error', message: 'Passwords do not match.' });
  }
};

export const registerCredentialsHandler = async (
  request: FastifyRequest<{
    Body: RegisterValues;
  }>,
  reply: FastifyReply,
) => {
  const data = request.body;

  const emailTaken = Boolean(
    await db.user.count({
      where: {
        email: data.email,
      },
    }),
  );

  if (emailTaken) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'error', message: 'Email is already taken.' });
  }

  const usernameTaken = Boolean(
    await db.user.count({
      where: {
        username: data.username,
      },
    }),
  );

  if (usernameTaken) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'error', message: 'Username is already taken.' });
  }

  try {
    const registeredUser = await registerUser(data);
    request.session.data = registeredUser;

    return reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send({ status: error });
  }
};

export const getCurrentUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session.data) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'No user data' });
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

  return reply.code(httpCodes.SUCCESS).send(userWithPreferences);
};

export const signOutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await request.session.destroy();
  return reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
};

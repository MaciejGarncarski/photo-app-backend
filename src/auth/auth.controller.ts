import { verify } from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';

import { SignInValues } from './auth.schema';
import { httpCodes } from '../consts/httpStatus';
import { db } from '../prisma/db';
import { registerIfNotExists } from '../utils/registerIfNotExists';

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
    const registeredUser = await registerIfNotExists({ email, password });

    request.session.data = registeredUser;
    return reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
  }

  const isPasswordEqual = await verify(user?.password || '', password);

  if (!isPasswordEqual) {
    return reply.status(httpCodes.FORBIDDEN).send({ status: 'Passwords do not mach' });
  }

  request.session.data = user;
  return reply.code(httpCodes.SUCCESS).send({ status: 'ok' });
};

export const getCurrentUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session.data) {
    return reply.code(httpCodes.SUCCESS).send({ status: 'No user data' });
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

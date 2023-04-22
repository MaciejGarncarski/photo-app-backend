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

    await request.session.regenerate();
    request.session.user = registeredUser;
    return reply.code(httpCodes.SUCCESS).send('ok');
  }

  const isPasswordEqual = await verify(user?.password || '', password);

  if (!isPasswordEqual) {
    return reply.status(httpCodes.FORBIDDEN).send('Passwords do not match.');
  }

  await request.session.regenerate();
  request.session.user = user;

  return reply.code(httpCodes.SUCCESS).send('ok');
};

export const getCurrentUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session.user) {
    return reply.code(httpCodes.SUCCESS).send('no user data');
  }

  return reply.code(httpCodes.SUCCESS).send(request.session.user);
};

export const signOutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await request.session.destroy();
  return reply.code(httpCodes.SUCCESS).send({ redirect: '/' });
};

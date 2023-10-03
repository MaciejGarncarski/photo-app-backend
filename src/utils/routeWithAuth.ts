import { FastifyReply, FastifyRequest } from 'fastify';

import { getServerSession } from './getServerSession.js';
import { httpCodes } from '../consts/httpStatus.js';

export const routeWithAuth = async <T extends FastifyRequest>(request: T, reply: FastifyReply, next: () => void) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  next();
};

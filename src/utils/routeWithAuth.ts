import { FastifyReply, FastifyRequest } from 'fastify';

import { getServerSession } from './getServerSession';
import { httpCodes } from '../consts/httpStatus';

export const routeWithAuth = async <T extends FastifyRequest>(request: T, reply: FastifyReply, next: () => void) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  next();
};

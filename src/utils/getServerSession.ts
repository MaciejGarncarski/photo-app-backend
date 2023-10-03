import { FastifyRequest } from 'fastify';

import { db } from './db.js';

export const getServerSession = async (request: FastifyRequest) => {
  const sessionId = request.session.sessionId;

  const session = await db.session.findFirst({
    where: {
      sid: sessionId,
    },
    select: {
      data: true,
    },
  });

  if (!session) {
    return { sessionUser: null };
  }

  const sessionUser = await db.user.findFirst({
    where: {
      id: session.data,
    },
  });

  if (sessionUser?.id) {
    request.session.data = sessionUser;
  }

  return { sessionUser: request.session.data };
};

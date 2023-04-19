import { FastifyRequest } from 'fastify';

import { db } from '../prisma/db';

export const getServerSession = async (request: FastifyRequest) => {
  const sessionId = request.session.sessionId;

  const userData = await db.session.findFirst({
    where: {
      id: sessionId,
    },
    select: {
      user: true,
    },
  });

  if (userData?.user) {
    request.session.user = userData.user;
  }

  return { sessionUser: request.session.user };
};

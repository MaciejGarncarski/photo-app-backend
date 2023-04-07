import { FastifyRequest } from 'fastify';

import { db } from '../prisma/db';
import { getUser } from '../user/user.service';

export const getServerSession = async (req: FastifyRequest) => {
  const sessionId = req.cookies['next-auth.session-token'];

  const session = await db.account.findFirst({
    where: {
      id_token: sessionId,
    },
  });

  if (session) {
    const currentUser = await getUser({ id: session.userId });
    return currentUser;
  }
  return null;
};

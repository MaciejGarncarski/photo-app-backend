import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

import { httpCodes } from '../consts/httpStatus';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
  if (!request.session.data) {
    return reply.code(httpCodes.UNAUTHORIZED).send('Unauthoriuzed');
  }

  done();
};

import { preHandlerHookHandler } from 'fastify';

export const authorize: preHandlerHookHandler = function (this, request, reply, done) {
  if (!request.session.data) {
    return reply.unauthorized('Unauthorized.');
  }

  done();
};

import { FastifyInstance } from 'fastify';

import { deleteAvatarHandler, editAccountHandler, updateAvatarHandler } from './session-user.controller';
import { $ref } from './session-user.schema';

export const sessionUserRoutes = async (server: FastifyInstance) => {
  server.post(
    '/edit-account',
    {
      schema: {
        body: $ref('editAccountInputSchema'),
      },
    },
    editAccountHandler,
  );
  server.post('/update-avatar', updateAvatarHandler);
  server.delete('/delete-avatar', deleteAvatarHandler);
};

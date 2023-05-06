import { CookieOptions } from '@fastify/session';
import ms from 'ms';

import { envVariables } from '../utils/envVariables';

export const cookie: CookieOptions = {
  httpOnly: true,
  maxAge: ms('3 weeks'),
  sameSite: envVariables.PRODUCTION === 'false' ? 'lax' : 'none',
  secure: envVariables.PRODUCTION === 'false' ? false : true,
};

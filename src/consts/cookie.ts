import { CookieOptions } from '@fastify/session';
import ms from 'ms';

import { envVariables } from '../utils/envVariables.js';

export const cookie: CookieOptions = {
  httpOnly: true,
  maxAge: ms('1 week'),
  sameSite: envVariables.PRODUCTION === 'true' ? 'none' : 'lax',
  secure: envVariables.PRODUCTION === 'true' ? true : false,
};

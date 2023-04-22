import { CookieOptions } from '@fastify/session';
import ms from 'ms';

import { envVariables } from '../utils/envVariables';

export const cookie: CookieOptions = {
  httpOnly: true,
  maxAge: ms('7 days'),
  sameSite: 'lax',
  secure: envVariables.PRODUCTION === 'false' ? false : true,
};

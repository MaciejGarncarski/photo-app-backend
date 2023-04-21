import { CookieOptions } from '@fastify/session';
import ms from 'ms';

export const cookie: CookieOptions = {
  httpOnly: true,
  maxAge: ms('7 days'),
  sameSite: 'none',
  secure: true,
};

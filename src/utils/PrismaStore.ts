import { PrismaClient, Session as PrismaSession } from '@prisma/client';
import { Session } from 'fastify';
import ms from 'ms';

import { cookie } from '../consts/cookie';
export class PrismaStore {
  constructor(private readonly prisma: PrismaClient) {}

  async set(sessionId: string, session: Session, callback: (err?: unknown) => void) {
    if (!session.user) {
      return callback();
    }

    try {
      const sessionData: PrismaSession = {
        id: sessionId,
        expires: session.cookie.expires || new Date(Date.now() + (session.cookie.maxAge || ms('7 days'))),
        userId: session.user.id,
      };

      await this.prisma.session.upsert({
        create: sessionData,
        update: sessionData,
        where: {
          id: sessionId,
        },
      });

      callback();
    } catch (error) {
      callback(error);
    }
  }

  async get(sessionId: string, callback: (err?: unknown, session?: Session) => void) {
    try {
      await this.prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });

      const sessionData = await this.prisma.session.findUnique({
        where: {
          id: sessionId,
        },
        select: {
          user: true,
          expires: true,
        },
      });

      if (!sessionData) {
        return callback();
      }

      const session = {
        user: sessionData.user,
        cookie,
      };

      return callback(undefined, session as Session);
    } catch (error) {
      callback(error);
    }
  }

  async destroy(sessionId: string, callback: (err?: unknown) => void) {
    try {
      await this.prisma.session.deleteMany({ where: { id: sessionId } });
      callback();
    } catch (error) {
      return callback(error);
    }
  }
}

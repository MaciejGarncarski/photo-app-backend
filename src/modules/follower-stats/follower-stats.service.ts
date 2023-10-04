import { FollowersResponse } from './follower-stats.schema.js';
import { db } from '../../utils/db.js';

export const USERS_PER_REQUEST = 4;

export const getFollowersStats = async (userId: string, skip: number, sessionUserId?: string) => {
  const users = await db.follower.findMany({
    skip: skip * USERS_PER_REQUEST,
    take: USERS_PER_REQUEST,
    where: {
      to: userId,
    },
  });

  const usersId = users.map(({ from }) => from);
  const usersCount = await db.follower.count({ where: { to: sessionUserId } });
  const maxPages = usersCount / USERS_PER_REQUEST;
  const totalPages = Math.ceil(maxPages) - 1;

  const response: FollowersResponse = {
    users: usersId,
    totalPages,
    currentPage: skip,
    usersCount,
  };

  return response;
};

export const getFriendsStats = async (userId: string, skip: number, sessionUserId?: string) => {
  const users = await db.follower.findMany({
    skip: skip * USERS_PER_REQUEST,
    take: USERS_PER_REQUEST,
    where: {
      from: userId,
    },
  });

  const usersId = users.map(({ to }) => to);
  const usersCount = await db.follower.count({ where: { to: sessionUserId } });
  const maxPages = usersCount / USERS_PER_REQUEST;
  const totalPages = Math.ceil(maxPages) - 1;

  const response: FollowersResponse = {
    users: usersId,
    totalPages,
    currentPage: skip,
    usersCount,
  };

  return response;
};

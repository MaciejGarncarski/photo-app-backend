import { FollowersResponse } from './follower-stats.schema';
import { db } from '../prisma/db';
import { User } from '../user/user.schema';

export const USERS_PER_REQUEST = 4;

export const getFollowersStats = async (userId: string, skip: number, sessionUserId?: string) => {
  const users = await db.follower.findMany({
    skip: skip * USERS_PER_REQUEST,
    take: USERS_PER_REQUEST,
    select: {
      from_user: {
        include: {
          fromUser: {
            where: {
              from: sessionUserId,
            },
          },
          _count: { select: { posts: true, fromUser: true, toUser: true } },
        },
      },
    },

    where: {
      to: userId,
    },
  });

  const mappedUsers = users.map(
    ({
      from_user: {
        bio,
        created_at,
        customImage,
        _count: { fromUser: friendsCount, posts: postsCount, toUser: followersCount },
        id,
        image,
        name,
        username,
        fromUser,
      },
    }) => {
      const mappedUser: User = {
        bio,
        createdAt: created_at.toString(),
        customImage,
        id,
        name,
        username: username || '',
        image,
        postsCount,
        followersCount,
        friendsCount,
        isFollowing: Boolean(fromUser.find(({ from }) => from === sessionUserId)),
      };

      return mappedUser;
    },
  );

  const usersCount = await db.follower.count({ where: { to: sessionUserId } });
  const maxPages = usersCount / USERS_PER_REQUEST;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const response: FollowersResponse = {
    users: mappedUsers,
    totalPages,
    roundedMaxPages,
    currentPage: skip,
    usersCount,
  };

  return response;
};

export const getFriendsStats = async (userId: string, skip: number, sessionUserId?: string) => {
  const users = await db.follower.findMany({
    skip: skip * USERS_PER_REQUEST,
    take: USERS_PER_REQUEST,
    select: {
      to_user: {
        include: {
          toUser: {
            where: {
              to: userId,
            },
          },
          _count: { select: { posts: true, fromUser: true, toUser: true } },
        },
      },
    },

    where: {
      from: userId,
    },
  });

  const mappedUsers = users.map(
    ({
      to_user: {
        bio,
        created_at,
        customImage,
        _count: { fromUser: friendsCount, posts: postsCount, toUser: followersCount },
        id,
        image,
        name,
        username,
        toUser,
      },
    }) => {
      const mappedUser: User = {
        bio,
        createdAt: created_at.toString(),
        customImage,
        id,
        name,
        username: username || '',
        image,
        postsCount,
        followersCount,
        friendsCount,
        isFollowing: Boolean(toUser.find(({ to }) => to === sessionUserId)),
      };

      return mappedUser;
    },
  );

  const usersCount = await db.follower.count({ where: { to: sessionUserId } });
  const maxPages = usersCount / USERS_PER_REQUEST;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const response: FollowersResponse = {
    users: mappedUsers,
    totalPages,
    roundedMaxPages,
    currentPage: skip,
    usersCount,
  };

  return response;
};

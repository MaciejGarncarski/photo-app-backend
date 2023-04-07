import { User } from './user.schema';
import { db } from '../prisma/db';

type Config =
  | {
      id?: never;
      username: string;
    }
  | {
      username?: never;
      id: string;
    };

export const getUser = async (config: Config, serverSession?: User | null) => {
  const currentUserId = serverSession?.id;

  const userData = await db.user.findFirst({
    where: config,
    select: {
      bio: true,
      created_at: true,
      id: true,
      customImage: true,
      image: true,
      name: true,
      username: true,
      toUser: true,
      _count: {
        select: { posts: true, fromUser: true, toUser: true },
      },
    },
  });

  if (!userData) {
    return null;
  }

  const {
    _count: { fromUser, toUser, posts },
    bio,
    created_at,
    customImage,
    id,
    image,
    name,
    username,
  } = userData;

  const isFollowing =
    currentUserId !== userData.id &&
    userData.toUser.find((follower) => currentUserId && follower.from === currentUserId);

  const user = {
    bio,
    createdAt: created_at.toString(),
    customImage,
    followersCount: toUser,
    friendsCount: fromUser,
    postsCount: posts,
    id,
    image,
    isFollowing: Boolean(isFollowing),
    name,
    username: username || '',
  } satisfies User;

  return user;
};

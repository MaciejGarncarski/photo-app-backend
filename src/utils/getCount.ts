import { db } from '../prisma/db';

export const getCount = async (userId: string) => {
  try {
    const posts = db.post.count({
      where: {
        author_id: userId,
      },
    });
    const followers = db.follower.count({
      where: {
        to: userId,
      },
    });
    const friends = db.follower.count({
      where: {
        from: userId,
      },
    });

    const [postsCount, followersCount, friendsCount] = await Promise.all([posts, followers, friends]);

    return { postsCount, followersCount, friendsCount };
  } catch (error) {
    return { postsCount: 0, followersCount: 0, friendsCount: 0 };
  }
};

import { hash } from 'argon2';

import { RegisterValues } from '../auth/auth.schema.js';
import { User } from '../user/user.schema.js';
import { db } from '../../utils/db.js';

export const registerUser = async ({ email, username, password }: RegisterValues) => {
  const hashedPassword = await hash(password);

  const createdUser = await db.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  await db.userPreferences.create({
    data: {
      notificationSound: 'ON',
      theme: 'LIGHT',
      userId: createdUser.id,
    },
  });

  const mappedUser = {
    bio: createdUser.bio,
    createdAt: createdUser.createdAt.toString(),
    customImage: createdUser.customImage,
    id: createdUser.id,
    image: createdUser.image,
    name: createdUser.name,
    username: createdUser.username || '',
  } satisfies User;

  return mappedUser;
};

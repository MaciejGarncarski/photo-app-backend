import { hash } from 'argon2';

import { RegisterValues } from '../auth/auth.schema.js';
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

  return createdUser;
};

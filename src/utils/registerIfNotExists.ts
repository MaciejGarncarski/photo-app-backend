import { hash } from 'argon2';

import { SignInValues } from '../auth/auth.schema';
import { db } from '../prisma/db';

export const registerIfNotExists = async ({ email, password }: SignInValues) => {
  const hashedPassword = await hash(password);
  const createdUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return createdUser;
};

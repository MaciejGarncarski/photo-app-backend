import { MultipartFile } from '@fastify/multipart';

import { EditAccountInput } from './session-user.schema';
import { db } from '../prisma/db';
import { imageKit } from '../utils/imagekit';

export const deleteAvatar = async (sessionUserId: string) => {
  await imageKit.deleteFolder(`${sessionUserId}/avatar/custom/`);

  await db.user.update({
    data: {
      customImage: null,
    },
    where: {
      id: sessionUserId,
    },
  });
};

export const editAccount = async (sessionUserId: string, { bio, name, username }: EditAccountInput) => {
  await db.user.update({
    where: {
      id: sessionUserId,
    },
    data: {
      bio,
      name,
      username,
    },
  });
};

export const updateAvatar = async (sessionUserId: string, fileData: MultipartFile) => {
  const folder = `${sessionUserId}/avatar/custom/`;
  const fileBuffer = await fileData.toBuffer();

  const image = await imageKit.upload({
    file: fileBuffer,
    fileName: `${sessionUserId}-custom-avatar`,
    folder,
  });

  await db.user.update({
    where: {
      id: sessionUserId,
    },
    data: {
      customImage: image.url,
    },
  });
};

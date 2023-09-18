import { db } from '../prisma/db';

export const createChatRoom = async (receiverId: string, senderId: string) => {
  const chatRoomExists = await db.chatRoom.findFirst({
    where: {
      OR: [
        { senderId: senderId, receiverId: receiverId },
        { receiverId: senderId, senderId: receiverId },
      ],
    },
  });

  if (chatRoomExists) {
    return;
  }

  await db.chatRoom.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
    },
  });
};

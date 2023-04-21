import { db } from '../prisma/db';

export const createChatRoom = async (receiverId: string, senderId: string) => {
  const chatRoomExists = await db.chatRoom.findFirst({
    where: {
      OR: [
        { sender_id: senderId, receiver_id: receiverId },
        { receiver_id: senderId, sender_id: receiverId },
      ],
    },
  });

  if (chatRoomExists) {
    return;
  }

  await db.chatRoom.create({
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
    },
  });
};

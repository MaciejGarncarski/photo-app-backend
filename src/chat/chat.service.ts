import { CreateMessage } from './chat.schema';
import { db } from '../prisma/db';

export const createMessage = async ({ receiver, sender, message }: CreateMessage) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        {
          userOne_id: receiver,
          userTwo_id: sender,
        },
        {
          userOne_id: sender,
          userTwo_id: receiver,
        },
      ],
    },
  });

  await db.message.create({
    data: {
      receiver,
      sender,
      text: message,
    },
    select: {
      created_at: true,
      id: true,
    },
  });

  const roomName = `chatRoom-${chatRoom?.id}`;
  return { roomName };
};

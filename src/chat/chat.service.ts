import { ChatMessage, ChatMessagesResponse, ChatUsersResponse, CreateMessage } from './chat.schema';
import { db } from '../prisma/db';
import { getChatUsersByName } from '../utils/getChatUsersByName';

export const createChatRoom = async (receiverId: string, senderId: string) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        { sender_id: senderId, receiver_id: receiverId },
        { receiver_id: senderId, sender_id: receiverId },
      ],
    },
  });

  if (chatRoom) {
    return chatRoom;
  }

  const senderRequest = db.user.findFirst({ where: { id: senderId } });
  const receiverRequest = db.user.findFirst({ where: { id: receiverId } });
  const [sender, receiver] = await Promise.all([senderRequest, receiverRequest]);

  if (!sender || !receiver) {
    return null;
  }

  const createdChatRoom = await db.chatRoom.create({
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
    },
  });

  return createdChatRoom;
};

export const deleteMessage = async (sessionId: string, messageId: string) => {
  const message = await db.message.findFirst({
    where: {
      id: messageId,
    },
  });

  if (message?.sender_id !== sessionId) {
    return;
  }

  await db.message.deleteMany({
    where: {
      id: messageId,
    },
  });

  return 'ok';
};

export const createMessage = async ({ receiverId, senderId, message }: CreateMessage) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        {
          sender_id: receiverId,
          receiver_id: senderId,
        },
        {
          sender_id: senderId,
          receiver_id: receiverId,
        },
      ],
    },
  });

  if (!chatRoom) {
    return;
  }

  await db.message.create({
    data: {
      receiver_id: receiverId,
      sender_id: senderId,
      text: message,
      chatroom_id: chatRoom?.id,
    },
    select: {
      created_at: true,
      id: true,
    },
  });

  const roomName = `chatRoom-${chatRoom?.id}`;
  return { roomName };
};

const MESSAGES_PER_REQUEST = 20;

export const chatMessages = async (sessionUserId: string, receiverId: string, skip: number) => {
  const includeData = {
    include: {
      fromUser: {
        where: {
          from: sessionUserId,
        },
      },
    },
  };

  const chatMessages = await db.message.findMany({
    skip: skip * MESSAGES_PER_REQUEST,
    take: MESSAGES_PER_REQUEST,
    orderBy: [
      {
        created_at: 'desc',
      },
    ],
    include: {
      sender: includeData,
      receiver: includeData,
    },
    where: {
      OR: [
        {
          receiver_id: receiverId,
          sender_id: sessionUserId,
        },
        {
          receiver_id: sessionUserId,
          sender_id: receiverId,
        },
      ],
    },
  });

  const mappedMessages = chatMessages.map(({ id, text, sender, receiver, created_at }) => {
    const message: ChatMessage = {
      id,
      text,
      createdAt: created_at,
      receiverId: receiver.id,
      senderId: sender.id,
    };

    return message;
  });

  const messagesCount = await db.message.count({
    where: {
      OR: [
        {
          receiver_id: receiverId,
          sender_id: sessionUserId,
        },
        {
          receiver_id: sessionUserId,
          sender_id: receiverId,
        },
      ],
    },
  });

  const maxPages = messagesCount / MESSAGES_PER_REQUEST;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const response: ChatMessagesResponse = {
    messages: mappedMessages,
    roundedMaxPages,
    totalPages,
    currentPage: skip,
    messagesCount,
  };

  return response;
};

const CHAT_USERS_PER_REQUEST = 10;

export const chatUsers = async (sessionUserId: string, searchedUser: string, skip: number) => {
  const { users, usersCount } = await getChatUsersByName(searchedUser, skip, sessionUserId);
  const mappedUsers = users.map(({ id }) => id);

  const maxPages = usersCount / CHAT_USERS_PER_REQUEST;
  const totalPages = Math.round(maxPages);

  const result: ChatUsersResponse = {
    users: mappedUsers,
    currentPage: skip,
    totalPages,
    usersCount,
  };

  return result;
};

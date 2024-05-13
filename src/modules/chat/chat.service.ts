import { ChatMessage, ChatMessagesResponse, ChatUsersResponse, CreateMessage } from './chat.schema.js';
import { db } from '../../utils/db.js';
import { getChatUsers } from '../../utils/get-chat-users.js';
import { mapChatUsers } from '../../utils/map-chat-users.js';
import { sortChatUsers } from '../../utils/sort-chat-users.js';

export const createChatRoom = async (username: string, senderId: string) => {
  const receiverData = await db.user.findFirst({
    where: {
      username,
    },
  });

  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        { senderId, receiverId: receiverData?.userId },
        { receiverId: senderId, senderId: receiverData?.userId },
      ],
    },
  });

  if (chatRoom) {
    return chatRoom;
  }

  const senderRequest = db.user.findFirst({ where: { userId: senderId } });
  const receiverRequest = db.user.findFirst({ where: { userId: receiverData?.userId } });
  const [sender, receiver] = await Promise.all([senderRequest, receiverRequest]);

  if (!sender || !receiver || !receiverData?.userId) {
    return null;
  }

  const createdChatRoom = await db.chatRoom.create({
    data: {
      senderId: senderId,
      receiverId: receiverData?.userId,
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

  if (message?.senderId !== sessionId) {
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
          senderId: receiverId,
          receiverId: senderId,
        },
        {
          senderId: senderId,
          receiverId: receiverId,
        },
      ],
    },
  });

  if (!chatRoom) {
    return;
  }

  const createdMessage = await db.message.create({
    data: {
      receiverId,
      senderId,
      text: message,
      chatroomId: chatRoom?.id,
    },
  });

  const roomName = `chatRoom-${chatRoom?.id}`;
  return { roomName, createdMessage };
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
        createdAt: 'desc',
      },
    ],
    include: {
      sender: includeData,
      receiver: includeData,
    },
    where: {
      OR: [
        {
          receiverId: receiverId,
          senderId: sessionUserId,
        },
        {
          receiverId: sessionUserId,
          senderId: receiverId,
        },
      ],
    },
  });

  const mappedMessages = chatMessages.map(({ id, text, sender, receiver, createdAt }) => {
    const message: ChatMessage = {
      id,
      text: text,
      createdAt: createdAt.toString(),
      receiverId: receiver.userId,
      senderId: sender.userId,
    };

    return message;
  });

  const messagesCount = await db.message.count({
    where: {
      OR: [
        {
          receiverId: receiverId,
          senderId: sessionUserId,
        },
        {
          receiverId: sessionUserId,
          senderId: receiverId,
        },
      ],
    },
  });

  const totalPages = Math.ceil(messagesCount / MESSAGES_PER_REQUEST) - 1;

  const response: ChatMessagesResponse = {
    messages: mappedMessages,
    totalPages,
    currentPage: skip,
    messagesCount,
  };

  return response;
};

export const CHAT_USERS_PER_REQUEST = 10;

export const chatUsers = async (sessionUserId: string, skip: number) => {
  const { users, usersCount } = await getChatUsers(skip, sessionUserId);
  const mappedUsers = users.map(mapChatUsers).sort(sortChatUsers);

  const maxPages = usersCount / CHAT_USERS_PER_REQUEST;
  const totalPages = Math.ceil(maxPages) - 1;

  const result: ChatUsersResponse = {
    users: mappedUsers,
    currentPage: skip,
    totalPages,
    usersCount,
  };

  return result;
};

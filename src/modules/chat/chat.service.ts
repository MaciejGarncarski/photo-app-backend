import { ChatMessage, ChatMessagesResponse, ChatUsersResponse, CreateMessage } from './chat.schema.js';
import { db } from '../../utils/db.js';
import { getChatUsers } from '../../utils/get-chat-users.js';

export const createChatRoom = async (receiverId: string, senderId: string) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { receiverId: senderId, senderId: receiverId },
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
      senderId: senderId,
      receiverId: receiverId,
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
      text,
      createdAt: createdAt.toString(),
      receiverId: receiver.id,
      senderId: sender.id,
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

const CHAT_USERS_PER_REQUEST = 10;

export const chatUsers = async (sessionUserId: string, skip: number) => {
  const { users, usersCount } = await getChatUsers(skip, sessionUserId);

  // sentMessage ?

  const mappedUsers = users.map(({ id, sentMessages, receivedMessages }) => {
    const sentMessage = sentMessages[0] || null;
    const receivedMessage = receivedMessages[0] || null;

    if (!sentMessage && !receivedMessage) {
      return {
        id,
        message: 'No messages yet.',
      };
    }

    if (!sentMessage && receivedMessage) {
      return {
        id,
        message: `You: ${receivedMessage.text}`,
      };
    }

    if (!receivedMessage && sentMessage) {
      return {
        id,
        message: sentMessage.text,
      };
    }

    const hasSentLastMessage = sentMessage.createdAt < receivedMessage.createdAt;
    const message = hasSentLastMessage ? `You: ${receivedMessage.text}` : sentMessage.text;

    return {
      id,
      message: message,
    };
  });

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

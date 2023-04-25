import { ChatMessage, ChatMessagesResponse, ChatUsersResponse, CreateMessage } from './chat.schema';
import { db } from '../prisma/db';
import { User } from '../user/user.schema';

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

const MESSAGES_PER_REQUEST = 6;
export const chatMessages = async (sessionUserId: string, receiverId: string, skip: number) => {
  const chatMessages = await db.message.findMany({
    skip: skip * MESSAGES_PER_REQUEST,
    take: MESSAGES_PER_REQUEST,
    orderBy: [
      {
        created_at: 'desc',
      },
    ],
    include: {
      sender: {
        include: {
          fromUser: {
            where: {
              from: sessionUserId,
            },
          },
          _count: {
            select: {
              fromUser: true,
              toUser: true,
              posts: true,
            },
          },
        },
      },
      receiver: {
        include: {
          fromUser: {
            where: {
              from: sessionUserId,
            },
          },
          _count: {
            select: {
              fromUser: true,
              toUser: true,
              posts: true,
            },
          },
        },
      },
    },
    where: {
      receiver_id: receiverId,
      sender_id: sessionUserId,
    },
  });

  const mappedMessages = chatMessages.map(({ id, text, sender, receiver, created_at }) => {
    const message: ChatMessage = {
      id,
      text,
      createdAt: created_at,
      receiverId: receiver.id,
      senderId: sender.id,
      sender: {
        bio: sender.bio,
        createdAt: sender.created_at.toString(),
        customImage: sender.customImage,
        id: sender.id,
        image: sender.image,
        isFollowing: Boolean(sender.fromUser.find(({ from }) => from === sessionUserId)),
        username: sender.username || '',
        name: sender.name,
        postsCount: sender._count.posts,
        followersCount: sender._count.toUser,
        friendsCount: sender._count.fromUser,
      },
      receiver: {
        bio: receiver.bio,
        createdAt: receiver.created_at.toString(),
        customImage: receiver.customImage,
        id: receiver.id,
        image: receiver.image,
        isFollowing: Boolean(receiver.fromUser.find(({ from }) => from === sessionUserId)),
        username: receiver.username || '',
        name: receiver.name,
        postsCount: receiver._count.posts,
        followersCount: receiver._count.toUser,
        friendsCount: receiver._count.fromUser,
      },
    };

    return message;
  });

  const messagesCount = await db.message.count({
    where: {
      receiver_id: receiverId,
      sender_id: sessionUserId,
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

const CHAT_USERS_PER_REQUEST = 7;

export const chatUsers = async (sessionUserId: string, searchedUser: string, skip: number) => {
  const users = await db.user.findMany({
    skip: skip * CHAT_USERS_PER_REQUEST,
    take: CHAT_USERS_PER_REQUEST,
    where: {
      OR: [{ username: { contains: searchedUser } }, { name: { contains: searchedUser } }],
      NOT: [{ id: sessionUserId }],
    },
    include: {
      _count: {
        select: {
          posts: true,
          fromUser: true,
          toUser: true,
        },
      },
    },
  });

  const mappedUsers = users.map(
    ({ bio, created_at, customImage, image, id, name, username, _count: { fromUser, posts, toUser } }) => {
      const mappedUser: User = {
        bio,
        createdAt: created_at.toString(),
        customImage,
        image,
        id,
        username: username || '',
        name,
        isFollowing: false,
        postsCount: posts,
        followersCount: toUser,
        friendsCount: fromUser,
      } satisfies User;

      return mappedUser;
    },
  );

  const usersCount = await db.user.count({
    where: {
      NOT: [{ id: sessionUserId }],
    },
  });

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

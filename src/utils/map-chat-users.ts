type ChatUser = {
  userId: string;
  sentMessages: {
    createdAt: Date;
    text: string;
  }[];
  receivedMessages: {
    createdAt: Date;
    text: string;
  }[];
};

export const mapChatUsers = ({ userId, sentMessages, receivedMessages }: ChatUser) => {
  const sentMessage = sentMessages[0] || null;
  const receivedMessage = receivedMessages[0] || null;

  if (!sentMessage && !receivedMessage) {
    return {
      userId,
      message: 'No messages yet.',
      messageCreatedAt: null,
    };
  }

  if (!sentMessage && receivedMessage) {
    return {
      userId,
      message: `You: ${receivedMessage.text}`,
      messageCreatedAt: receivedMessage.createdAt.toString(),
    };
  }

  if (!receivedMessage && sentMessage) {
    return {
      userId,
      message: sentMessage.text,
      messageCreatedAt: sentMessage.createdAt.toString(),
    };
  }

  const hasSentLastMessage = sentMessage.createdAt < receivedMessage.createdAt;
  const message = hasSentLastMessage ? `You: ${receivedMessage.text}` : sentMessage.text;

  return {
    userId,
    message: message,
    messageCreatedAt: (hasSentLastMessage ? receivedMessage.createdAt : sentMessage.createdAt).toString(),
  };
};

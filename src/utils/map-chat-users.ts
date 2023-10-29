type ChatUser = {
  id: string;
  sentMessages: {
    createdAt: Date;
    text: string;
  }[];
  receivedMessages: {
    createdAt: Date;
    text: string;
  }[];
};

export const mapChatUsers = ({ id, sentMessages, receivedMessages }: ChatUser) => {
  const sentMessage = sentMessages[0] || null;
  const receivedMessage = receivedMessages[0] || null;

  if (!sentMessage && !receivedMessage) {
    return {
      id,
      message: 'No messages yet.',
      messageCreatedAt: null,
    };
  }

  if (!sentMessage && receivedMessage) {
    return {
      id,
      message: `You: ${receivedMessage.text}`,
      messageCreatedAt: receivedMessage.createdAt.toString(),
    };
  }

  if (!receivedMessage && sentMessage) {
    return {
      id,
      message: sentMessage.text,
      messageCreatedAt: sentMessage.createdAt.toString(),
    };
  }

  const hasSentLastMessage = sentMessage.createdAt < receivedMessage.createdAt;
  const message = hasSentLastMessage ? `You: ${receivedMessage.text}` : sentMessage.text;

  return {
    id,
    message: message,
    messageCreatedAt: (hasSentLastMessage ? receivedMessage.createdAt : sentMessage.createdAt).toString(),
  };
};

import React from 'react';
import { Chatbot } from 'react-chatbot-kit';
import useChatMessages from './Hooks/useChatMessages';

const actionProvider = {
  handleGreeting: () => {
    return 'Hello! How can I assist you today?';
  },

  handleProductInquiry: (product) => {
    return `Sure, let me find information about ${product} for you.`;
  },
};
const messageParser = {
  // Parse user messages and determine the appropriate action
  parse: (message) => {
    if (message.includes('product')) {
      // You can add more conditions based on user input
      return {
        action: 'handleProductInquiry',
        parameters: { product: message },
      };
    } else if (message.includes('order')) {
      return {
        action: 'handleOrderStatus',
        parameters: { orderNumber: message },
      };
    } else {
      // Fallback for unknown queries
      return { action: 'handleUnknown', parameters: {} };
    }
  },
};

const ChatbotComponent = () => {
  const { messages, addMessage } = useChatMessages();
  const handleUserMessage = (message) => {
    const { action, parameters } = messageParser.parse(message);

    if (action && actionProvider[action]) {
      const botResponse = actionProvider[action](parameters);
      addMessage({ text: botResponse, isUser: false });
    } else {
      // Handle unknown actions or provide a default response
      addMessage({
        text: "I'm sorry, I don't understand that.",
        isUser: false,
      });
    }
  };

  const config = {
    inputPlaceholder: 'Type a message…',
    initialMessages: [
      { text: 'Welcome to our eCommerce chat!', isUser: false },
      { text: 'How can I help you today?', isUser: false },
    ],
  };

  return (
    <div>
      <Chatbot
        config={config}
        actionProvider={actionProvider}
        messageParser={messageParser}
        handleUserMessage={handleUserMessage}
      />
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.text}</div>
        ))}
      </div>
    </div>
  );
};
export default ChatbotComponent;

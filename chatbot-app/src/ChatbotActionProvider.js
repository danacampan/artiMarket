import axios from 'axios';

class ChatbotActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  async handleBotResponse() {
    const response = await axios.get(
      'https://api.example.com/chatbot-response'
    );
    const { message } = response.data;
    const chatbotMessage = this.createChatBotMessage(message);
    this.setChatbotMessage(chatbotMessage);
  }

  setChatbotMessage(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ChatbotActionProvider;

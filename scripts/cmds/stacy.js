const axios = require('axios');
const rateLimit = new Map();
const description = "";

module.exports.config = {
  name: "stacy",
  aliases: ["stacy", "st", "chat"],
  haspermssion: 0,
  version: 1.1,
  credits: "lance x Raphael ilom",
  cooldowns: 2,
  usePrefix: false,
  description: "stacy (query)",
  commandCategory: "AI",
  usages: "[question]"
};

module.exports.handleReply = async function ({ api, event }) {
  const { messageID, threadID } = event;
  const id = event.senderID;
  const inp = event.body;
  const link = `https://character-ai-by-lance.onrender.com/api/chat?message=${encodeURIComponent(inp)}&chat_id=${id}&custom-ai-prompt=${description}`;

  try {
    const response = await axios.get(link);
    api.sendMessage(response.data.text, threadID, messageID);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    api.sendMessage("An error occurred while processing your request.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, args, event }) {
  const { threadID, messageID } = event;
  const inp = args.join(' ');
  const id = event.senderID;
  const link = `https://character-ai-by-lance.onrender.com/api/chat?message=${encodeURIComponent(inp)}&chat_id=${id}&custom-ai-prompt=${description}`;

  // Rate limiting
  if (rateLimit.has(id) && (Date.now() - rateLimit.get(id)) < 2000) {
    return api.sendMessage("Please wait a moment before sending another request.", threadID, messageID);
  }
  rateLimit.set(id, Date.now());

  if (!inp) {
    return api.sendMessage("Please provide a query.", threadID, messageID);
  }

  if (inp.toLowerCase() === 'clear') {
    try {
      const response = await axios.get(`https://character-ai-by-lance.onrender.com/api/history?cmd=yes&chat_id=${id}`);
      const message = response.data.message ? 'Successfully deleted chat history.' : 'Chat history not deleted.';
      api.sendMessage(message, threadID, messageID);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage("An error occurred while clearing chat history.", threadID, messageID);
    }
  } else if (inp.toLowerCase() === 'help') {
    const helpMessage = `
      ** Command Help**
      - **chat [question]**: Ask Stacy a question.
      - **chat clear**: Clear chat history.
      - **chat help**: Show this help message.
    `;
    api.sendMessage(helpMessage, threadID, messageID);
  } else {
    try {
      const response = await axios.get(link);
      api.sendMessage(response.data.text, threadID, messageID);
      global.client.handleReply.push({
        name: this.config.name,
        author: event.senderID
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
  }
};

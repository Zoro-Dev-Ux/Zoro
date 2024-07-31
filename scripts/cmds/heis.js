const axios = require('axios');

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAIResponse(input, userId, messageID) {
  const services = [
    { url: 'https://ai-tools.replit.app/gpt', params: { prompt: input, uid: userId } },
    { url: 'https://openaikey-x20f.onrender.com/api', params: { prompt: input } },
    { url: 'http://fi1.bot-hosting.net:6518/gpt', params: { query: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = "✰ Hi cutie 🥺 how are you doing, I'm stiles how can I help you 💙🎧🖤𝐢𝐬 🪶✰";
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    if (data && (data.gpt4 || data.reply || data.response)) {
      response = data.gpt4 || data.reply || data.response;
      break;
    }
    currentIndex = (currentIndex + 1) % services.length; // Move to the next service in the cycle
  }

  return { response, messageID };
}
const prefixes = ['Ilom', 'stiles','Raphael'];
module.exports = {
  config: {
    name: 'Ilom',
    author: 'Raphael',
    role: 0,
    category: 'Ilom',
    shortDescription: 'ai to ask anything',
  },
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`😃 Raphael scholar 🧒🧑\n✰✰✰✰✰✰✰✰\n   Hi cutie 🥺 how are you doing dear, I'm stiles how can I help you 💙🎧🖤  🪶.\n✰✰✰✰✰✰✰✰`, event.threadID, event.messageID);
      return;
    }

    const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(` 😃 Raphael scholar 🧒🧑 \n✰✰✰✰✰✰✰✰\n${response}\n✰✰✰✰✰✰✰✰`, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            data: response,
            type: "reply"
        });
    }, messageID);
  },
  onChat: async function ({ event, message, args }) {
    const messageContent = event.body.trim().toLowerCase();
   if (prefixes.some(prefix => messageContent.startsWith(prefix))) {
      const input = args.join(" ").trim();
      const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
      message.send(`🌹 hêîs brõkêñ 💙 🎧 🖤 🌹\n🪶${response}🪶\n`, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            data: response,
            type: "reply"
        });
    }, messageID);
    }
  },

  onReply: async({ api, event, message, Reply }) => {
    const { data, author, messageID } = Reply;
    if(author != event.senderID) return;
    const reply = event.body.trim().toLowerCase();
    if(event.type === 'message_reply'){
        if(isNaN(reply)){
    const { response, messageID } = await getAIResponse(reply, event.senderID, message.messageID);
    api.sendMessage(` 😃 Raphael scholar 🧒🧑 \n✰✰✰✰✰✰✰✰\n${response}\n✰✰✰✰✰✰✰✰`, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            data: response,
            type: "reply"
        });
    }, messageID);
}
//---------------------//
if(isNaN(reply)){
    const { response, messageID } = await getAIResponse(reply, event.senderID, message.messageID);
    api.sendMessage(` 😃 Raphael scholar 🧒🧑 \n✰✰✰✰✰✰✰✰\n${response}\n✰✰✰✰✰✰✰✰`, event.threadID, messageID);
}
    }
  }
};

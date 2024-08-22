cmd install hi.js const fs = require('fs');

module.exports = {
  config: {
    name: "menyapa",
    version: "1.0",
    author: "Raphael ilom",
    countDown: 5,
    role: 0,
    shortDescription: "Hii",
    longDescription: "auto bot reply to your message",
    category: "no prefix",
  },
 
  onStart: async function() {},
 
  onChat: async function({ event, message, getLang, api }) {
    if (event.body) {
      const word = event.body.toLowerCase();
      switch (word) {
        case "hi":
          const replies = [
            "𝗛𝗲𝘆 𝗕𝗮𝗸𝗮 𝗛𝗮𝘃𝗲 𝗔 𝗪𝗼𝗻𝗱𝗲𝗿𝗳𝘂𝗹 𝗗𝗮𝘆🙂 ",
          ];
          api.setMessageReaction("💗", event.messageID, event.messageID, api); 
          const randomIndex = Math.floor(Math.random() * replies.length);
          message.reply({
            body: replies[randomIndex],
          });
          break;
        default:
          return; 
      }
    }
  },
};

const axios = require('axios');

const TINYURL_API_KEY = 'goZ66KEqK7xxt7gGJaTcFo0K89McxwZ7c4bucA2ZYuZLT25I9zgErEpLy8qj';

async function shortenURL(url) {
  try {
    const response = await axios.post('https://api.tinyurl.com/create', {
      url: url,
      domain: 'tiny.one'
    }, {
      headers: {
        Authorization: `Bearer ${TINYURL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data.tiny_url;
  } catch (error) {
    console.error(`Error shortening URL: ${error.message}`);
    return null;
  }
}

module.exports = {
  config: {
    name: "link",
    version: "1.2",
    author: "Raphael ilom",
    countDown: 5,
    role: 0,
    shortDescription: "Fetch and shorten image, audio, and video URLs.",
    longDescription: {
      en: "Fetch and shorten image, audio, and video URLs using TinyURL.",
    },
    category: "media",
    guide: {
      en: "{prefix}getlink <reply with img or vid>",
    },
  },

  onStart: async function ({ api, event, getText }) {
    const { messageReply } = event;

    if (event.type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length !== 1) {
      return api.sendMessage("Please reply to a single image, audio, or video attachment.", event.threadID, event.messageID);
    }

    const attachment = messageReply.attachments[0];
    const url = attachment.url;

    try {
      const shortURL = await shortenURL(url);
      if (shortURL) {
        api.sendMessage(`Here's your requested URL: ${shortURL}`, event.threadID, event.messageID);
      } else {
        api.sendMessage("Failed to shorten the URL.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
  }
};

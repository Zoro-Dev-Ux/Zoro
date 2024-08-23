const axios = require('axios');

module.exports = {
  config: {
    name: "horoscope",
    version: "1.0",
    author: "Raphael ilom",
    countDown: 5,
    role: 0,
    shortDescription: "Get the daily horoscope for a specified zodiac sign.",
    longDescription: {
      en: "This command allows you to get the daily horoscope for a specified zodiac sign."
    },
    category: "Fun",
    guide: {
      en: "{prefix}horoscope <zodiac sign>"
    }
  },

  onStart: async function({ api, event, args }) {
    const sign = args.join(' ').toLowerCase();
    if (!sign) {
      return api.sendMessage("Please provide a zodiac sign.", event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, { method: 'POST' });
      const horoscope = response.data.description;
      api.sendMessage(`Horoscope for ${sign}: ${horoscope}`, event.threadID, event.messageID);
    } catch (error) {
      console.error(`Error fetching horoscope: ${error.message}`);
      api.sendMessage("An error occurred while fetching the horoscope.", event.threadID, event.messageID);
    }
  }
};

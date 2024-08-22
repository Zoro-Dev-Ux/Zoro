const axios = require('axios');

async function getFunFact() {
  const url = 'https://uselessfacts.jsph.pl/random.json?language=en';

  try {
    const response = await axios.get(url);
    return response.data.text;
  } catch (error) {
    console.error('Error fetching fun fact:', error);
    return 'Sorry, I couldn\'t fetch a fun fact at the moment.';
  }
}

module.exports = {
  config: {
    name: 'funfact',
    author: 'Raphael Ilom',
    role: 0,
    category: 'fun',
    shortDescription: 'Get a random fun fact',
  },
  onStart: async function ({ api, event }) {
    const funFact = await getFunFact();
    api.sendMessage(`Did you know?\n\n${funFact}`, event.threadID, event.messageID);
  }
};

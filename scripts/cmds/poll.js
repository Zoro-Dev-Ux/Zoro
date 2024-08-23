module.exports.config = {
  name: "poll",
  aliases: ["poll", "vote"],
  haspermssion: 0,
  version: 1.0,
  credits: "Raphael ilom",
  cooldowns: 2,
  usePrefix: true,
  description: "Create a simple poll.",
  commandCategory: "Utility",
  usages: "[question] | [option1] | [option2] | ..."
};

module.exports.run = async function ({ api, args, event }) {
  const { threadID, messageID } = event;
  const input = args.join(' ').split('|').map(item => item.trim());

  if (input.length < 3) {
    return api.sendMessage("Please provide a question and at least two options.", threadID, messageID);
  }

  const [question, ...options] = input;
  let pollMessage = `**${question}**\n\n`;

  options.forEach((option, index) => {
    pollMessage += `${index + 1}. ${option}\n`;
  });

  api.sendMessage(pollMessage, threadID, (err, info) => {
    if (err) return console.error(err);

    options.forEach((option, index) => {
      api.setMessageReaction(`${index + 1}️⃣`, info.messageID);
    });
  });
};

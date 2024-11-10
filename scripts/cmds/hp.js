const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "hêîṣ ɓr̃õƙêñ 💔";

function formatFont(text) {
  const fontMapping = {
    A: "𝙰", B: "𝙱", C: "𝙲", D: "𝙳", E: "𝙴", F: "𝙵", G: "𝙶", H: "𝙷", I: "𝙸", J: "𝙹", K: "𝙺", L: "𝙻", M: "𝙼",
    N: "𝙽", O: "𝙾", P: "𝙿", Q: "𝚀", R: "𝚁", S: "𝚂", T: "𝚃", U: "𝚄", V: "𝚅", W: "𝚆", X: "𝚇", Y: "𝚈", Z: "𝚉"
  };
  return text.split('').map(char => fontMapping[char.toUpperCase()] || char).join('');
}

module.exports = {
  config: {
    name: "hp",
    version: "1.18",
    author: "Raphael Scholar",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list"
    },
    longDescription: {
      en: "View detailed command usage and list all available commands"
    },
    category: "info",
    guide: {
      en: "{pn} [command_name]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = await getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = `❀━━━━━━━━━━━━━━❀\n    🇳🇬 【 hêîṣ ɓr̃õƙêñ 💔】🇳🇬 \n❀━━━━━━━━━━━━━━❀\n`;

      for (const [name, value] of commands) {
        if (value.config.role > role) continue;

        const category = value.config.category || "Miscellaneous";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach(category => {
        const formattedCategory = formatFont(category.toUpperCase());
        msg += `\n╭───────────❃\n│『 ${formattedCategory} 』\n`;

        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i += 3) {
          const cmds = names.slice(i, i + 3).map(item => `│✵${item}`);
          msg += `${cmds.join(" ".repeat(Math.max(0, 15 - cmds.join("").length)))}\n`;
        }

        msg += `╰─────────────❍\n`;
      });

      const totalCommands = commands.size;
      msg += `╭──☉【 ☘ | 𝗘𝗡𝗝𝗢𝗬 】\n`;
      msg += `│» 𝙲𝚞𝚛𝚛𝚎𝚗𝚝𝚕𝚢, 𝚝𝚑𝚒𝚜 𝚋𝚘𝚝 \n│𝚑𝚊𝚜『 ${totalCommands} 』𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜\n│𝚝𝚑𝚊𝚝 𝕔𝕒𝕟 𝑏𝑒 𝚞𝚜𝚎𝚍.\n`;
      msg += `│» 𝚃𝚢𝚙𝚎 [ ${prefix}hp ] (/𝘤𝘮𝘥_𝘯𝘢𝘮𝘦\) \n│𝚃𝚘 𝚟𝚒𝚎𝚠 𝚍𝚎𝚝𝚊𝚒𝚕𝚜\n│𝚘𝚏 𝚑𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎\n`;
      msg += `│» 𝗧𝗬𝗣𝗘 [ ${prefix}support ] \n│to get added\n│to our support\n│GROUP CHAT\n`;
      msg += `╰─────────────❃\n`;
      msg += `╭────────────❃\n`;
      msg += `│¸¸♬· _🇳🇬·♫\n│🇳🇬 ${doNotDelete} 🇳🇬\n│¸¸♪·🇳🇬·♪·🇳🇬·♪¸¸\n`;
      msg += `╰──────────❃`;

      await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭──【 NAME 】──⭓
│【 ${configCommand.name} 】
├─【 INFO 】
│ Description: ${longDescription}
│ Other names: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
│ Version: ${configCommand.version || "1.0"}
│ Role: ${roleText}
│ Cooldown: ${configCommand.countDown || 1}s
│ Author: ${author}
├── Usage
│ ${usage}
├── Notes
│ The content inside <XXXXX> can be changed
│ The content inside [a|b|c] is a or b or c
╰──────────────⭓`;

        await message.reply(response);
      }
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (All users)";
    case 1: return "1 (Group administrators)";
    case 2: return "2 (Admin bot)";
    default: return "Unknown role";
  }
    

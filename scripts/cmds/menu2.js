const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "【 https://www.facebook.com/profile.php?id=61553871285563】";

const authorName = "Raphael Ilom";
const authorRights = { name: authorName, canBeChanged: false };

module.exports = {
  config: {
    name: "menu2",
    version: "4.1",
    author: authorName,
    countDown: 5,
    role: 0,
    shortDescription: { vi: "Xem cách dùng lệnh", en: "View command usage" },
    longDescription: { vi: "Xem cách sử dụng của các lệnh", en: "View command usage and information" },
    category: "Olea perfect",
    guide: {
      en: "{pn} [empty | <page number> | <command name>]"
        + "\n   {pn} <command name> [-u | usage | -g | guide]: show command usage"
        + "\n   {pn} <command name> [-i | info]: show command info"
        + "\n   {pn} <command name> [-r | role]: show command role"
        + "\n   {pn} <command name> [-a | alias]: show command alias"
        + "\n   {pn} category: show all command categories"
        + "\n   {pn} search <keyword>: search for commands"
        + "\n   {pn} stats: show command usage statistics"
        + "\n   {pn} update: check for menu updates"
    },
    priority: 1
  },

  langs: {
    en: {
      help: "╭───────────⦿ SPARKI PERFECT MENU ⦿───────────╮\n%1\n├───────────⦿ PAGE INFO ⦿───────────┤\n│ Page: [ %2/%3 ] | Total Commands: %4\n│ Prefix: %5\n├───────────⦿ USAGE INFO ⦿───────────┤\n│ Type: %5help <page> - View commands\n│ Type: %5help <cmd> - View details\n│ Type: %5help category - View categories\n│ Type: %5help search <keyword> - Search\n│ Type: %5help stats - View statistics\n│ Type: %5help update - Check for updates\n╰───────────⦿ %6 ⦿───────────╯",
      commandNotFound: "Command \"%1\" does not exist. Use %2help to see all commands.",
      getInfoCommand: "╭────⦿ COMMAND: %1 ⦿────╮\n│ Description: %2\n│ Aliases: %3\n│ Group Aliases: %4\n│ Version: %5\n│ Role: %6\n│ Cooldown: %7s\n│ Author: %8\n│ Category: %9\n├────⦿ USAGE ⦿────┤\n%10\n╰────⦿ END ⦿────╯",
      categoryList: "╭───────⦿ SPARKI PERFECT CATEGORIES ⦿───────╮\n%1\n╰───────⦿ TOTAL: %2 ⦿───────╯",
      searchResults: "╭───────⦿ SEARCH RESULTS ⦿───────╮\n%1\n╰───────⦿ FOUND: %2 ⦿───────╯",
      statsMessage: "╭───────⦿ COMMAND STATISTICS ⦿───────╮\n%1\n╰───────⦿ TOTAL USES: %2 ⦿───────╯",
      updateMessage: "Current version: %1\nLatest version: %2\n%3",
      upToDate: "Your menu is up to date!",
      updateAvailable: "An update is available. Please contact the bot administrator.",
      doNotHave: "Not available",
      roleText0: "All users",
      roleText1: "Group admins",
      roleText2: "Bot admins",
      pageNotFound: "Page %1 does not exist. Total pages: %2"
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    const [commandName, option] = args.map(arg => arg.toLowerCase());

    if (commandName === "category") {
      return this.showCategories(message, getLang);
    }

    if (commandName === "search" && args[1]) {
      return this.searchCommands(message, args.slice(1).join(" "), getLang, prefix);
    }

    if (commandName === "stats") {
      return this.showCommandStats(message, getLang);
    }

    if (commandName === "update") {
      return this.checkForUpdates(message, getLang);
    }

    if (!commandName || !isNaN(commandName)) {
      return this.showCommandList(message, parseInt(commandName) || 1, getLang, role, prefix);
    }

    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) {
      return message.reply(getLang("commandNotFound", commandName, prefix));
    }

    return this.showCommandDetails(message, command, option, threadData, getLang);
  },

  showCommandList: async function (message, page, getLang, role, prefix) {
    const commandList = Array.from(commands.values())
      .filter(cmd => cmd.config.role <= role)
      .map(cmd => ({
        name: cmd.config.name,
        description: cmd.config.shortDescription?.en || "No description",
        role: cmd.config.role,
        category: cmd.config.category || "Uncategorized"
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    const totalPage = Math.ceil(commandList.length / 10);
    if (page < 1 || page > totalPage) {
      return message.reply(getLang("pageNotFound", page, totalPage));
    }

    const startIdx = (page - 1) * 10;
    const visibleCommands = commandList.slice(startIdx, startIdx + 10);

    const commandDisplay = visibleCommands.map((cmd, idx) =>
      `│ ${startIdx + idx + 1}. ${cmd.name} (${cmd.category}): ${cmd.description}`
    ).join("\n");

    const helpMessage = getLang("help", commandDisplay, page, totalPage, commands.size, prefix, doNotDelete);

    const imageUrl = "https://tiny.one/yckvxnw8";
    
    message.reply({
      body: helpMessage,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    });
  },

  showCommandDetails: async function (message, command, option, threadData, getLang) {
    const formSendMessage = {
      body: getLang("getInfoCommand",
        command.config.name,
        command.config.description || getLang("doNotHave"),
        command.config.aliases ? command.config.aliases.join(", ") : getLang("doNotHave"),
        threadData.data.aliases ? (threadData.data.aliases[command.config.name] || []).join(", ") : getLang("doNotHave"),
        command.config.version,
        command.config.role == 0 ? getLang("roleText0") : command.config.role == 1 ? getLang("roleText1") : getLang("roleText2"),
        command.config.countDown || 1,
        authorRights.name,
        command.config.category || "Uncategorized",
        command.config.guide?.en || getLang("doNotHave"))
    };

    if (command.config.guide?.attachment) {
      formSendMessage.attachment = fs.createReadStream(path.resolve(__dirname, command.config.guide.attachment));
    }

    return message.reply(formSendMessage);
  },

  showCategories: async function (message, getLang) {
    const categories = new Set(Array.from(commands.values()).map(cmd => cmd.config.category || "Uncategorized"));
    const categoryList = Array.from(categories).sort().map((category, index) => `│ ${index + 1}. ${category}`).join("\n");
    const categoryMessage = getLang("categoryList", categoryList, categories.size);
    message.reply(categoryMessage);
  },

  searchCommands: async function (message, keyword, getLang, prefix) {
    const searchResults = Array.from(commands.values())
      .filter(cmd => cmd.config.name.includes(keyword) || cmd.config.aliases?.some(alias => alias.includes(keyword)))
      .map(cmd => `│ ${cmd.config.name} (${cmd.config.category || "Uncategorized"}): ${cmd.config.shortDescription?.en || "No description"}`)
      .join("\n");

    if (searchResults.length === 0) {
      return message.reply(`No commands found matching "${keyword}". Use ${prefix}help to see all commands.`);
    }

    const searchMessage = getLang("searchResults", searchResults, searchResults.split("\n").length);
    message.reply(searchMessage);
  },

  showCommandStats: async function (message, getLang) {
    const statsData = await this.loadStatsData();
    const sortedStats = Object.entries(statsData).sort((a, b) => b[1] - a[1]);
    const statsDisplay = sortedStats.map(([cmd, count], index) => `│ ${index + 1}. ${cmd}: ${count} uses`).join("\n");
    const totalUses = sortedStats.reduce((sum, [, count]) => sum + count, 0);
    const statsMessage = getLang("statsMessage", statsDisplay, totalUses);
    message.reply(statsMessage);
  },

  checkForUpdates: async function (message, getLang) {
    const currentVersion = this.config.version;
    try {
      const response = await axios.get("https://github.com/Isaiah-ilom/Ilom.git");
      const latestVersion = response.data.tag_name;
      const updateMessage = getLang("updateMessage", currentVersion, latestVersion,
        currentVersion === latestVersion ? getLang("upToDate") : getLang("updateAvailable"));
      message.reply(updateMessage);
    } catch (error) {
      message.reply("Unable to check for updates. Please try again later.");
    }
  },

  loadStatsData: async function () {
    try {
      return await fs.readJson("./data/commandStats.json");
    } catch (error) {
      return {};
    }
  },

  saveStatsData: async function (data) {
    await fs.writeJson("./data/commandStats.json", data, { spaces: 2 });
  },

  updateCommandStats: async function (commandName) {
    const statsData = await this.loadStatsData();
    statsData[commandName] = (statsData[commandName] || 0) + 1;
    await this.saveStatsData(statsData);
  }
};

function checkAuthorRights() {
  if (module.exports.config.author !== authorRights.name) {
    console.error("Unauthorized modification of author name detected. Exiting...");
    process.exit(1);
  }
}

setInterval(checkAuthorRights, 5000);

checkAuthorRights();

(async () => {
  if (!await fs.pathExists("./data/commandStats.json")) {
    await fs.writeJson("./data/commandStats.json", {}, { spaces: 2 });
  }
})()

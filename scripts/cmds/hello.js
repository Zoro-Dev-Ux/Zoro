cmd install hello.js module.exports = {
    config: {
        name: "hello",
        version: "1.1",
        author: "Luffy",
        countDown: 1,
        role: 0,
        shortDescription: " commencer une conversation ",
        longDescription: "ignore this command",
        category: "no prefix",
    },
onStart: async function(){}, 
onChat: async function({
    event,
    message,
    getLang
}) {
    if (event.body && event.body.toLowerCase() == "hello") return message.reply("🖕🏾");
} 
};

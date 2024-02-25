const discord = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const MODEL = "gemini-pro";
const API_KEY = process.env.API_KEY || "";
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const CHANNEL_ID = process.env.CHANNEL_ID || "";

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: MODEL });

const client = new discord.Client({
  intents: Object.keys(discord.GatewayIntentBits),
});

client.on("ready", () => {
  console.log("Bot is ready!");
});

client.login(BOT_TOKEN);

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    // Ignore messages that don't contain any meaningful content
    if (!message.content.trim()) {
      return;
    }

    await message.channel.sendTyping();
    
    const { response } = await model.generateContent(message.content);

    // Check if there is anything to say
    const generatedText = response.text().trim();
    if (!generatedText) {
      message.reply("I have nothing to say.");
      return;
    }

        // Check if the response was blocked due to safety
    if (response.text().includes("Response was blocked due to SAFETY")) {
       message.reply("I'm sorry, but I can't provide that response to keep the content safe and clean.");
       return;
        }

    // Check if the generated text is too long for Discord to handle
    if (generatedText.length > 2000) {
      message.reply("I have too much to say for Discord to fit in one message.");
    } else {
      message.reply({
        content: generatedText,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
});

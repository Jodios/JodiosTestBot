import Discord from "discord.js";
import { onVoiceChange } from "./service/OnVoiceChangeService";
import { onMessage } from "./service/OnMessageService";
import { connect as MongoConnect } from "./command/HolyAssembly";
import dotenv from "dotenv";
dotenv.config();
// MongoConnect();

let authKey = process.env.discordToken;
console.log(`authKey = ${process.env.discordToken}`)

// Initialize Discord Bot
let client = new Discord.Client();

client.on('ready', () => {
    console.log("connected");
    console.log('Logged in as: ');
    console.log(client.user?.tag + ' - (' + client.user?.id + ')');
    onVoiceChange(client);
    onMessage(client);    
});

client.login(authKey);
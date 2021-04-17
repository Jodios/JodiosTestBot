import Discord from "discord.js";
import { onVoiceChange } from "./service/OnVoiceChangeService";
import { onMessage } from "./service/OnMessageService";
import dotenv from "dotenv";
import figlet from "figlet";
dotenv.config();

let authKey = process.env.discordToken;
console.log(`authKey = ${process.env.discordToken}`)

// Initialize Discord Bot
let client = new Discord.Client();

client.on('ready', () => {
    // onVoiceChange(client);
    onMessage(client);    
    figlet("JodiosTestBot", (err, data) => {

        console.log(data);
        console.log("connected");
        console.log('Logged in as: ');
        console.log(client.user?.tag + ' - (' + client.user?.id + ')');
        
    })
});

client.login(authKey);
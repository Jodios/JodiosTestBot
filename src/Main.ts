import Discord from "discord.js";
import { mock } from "./command/Mock";
import dotenv from "dotenv";
dotenv.config()

let authKey = process.env.discordToken;
console.log(process.env);
console.log(`authKey = ${process.env.discordToken}`)
console.log(`MY_MAPPED_ENV_VAR = ${process.env.MY_MAPPED_ENV_VAR}`)

// Initialize Discord Bot
let bot = new Discord.Client();

bot.on('ready', () => {
    console.log("connected");
    console.log('Logged in as: ');
    console.log(bot.user?.tag + ' - (' + bot.user?.id + ')');
});

bot.on('message', (msg: Discord.Message)  => {
    if(msg.content[0] == "!"){
        let args = msg.content.substring(1).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            case 'mock':
                mock( msg, (msg.channel as Discord.TextChannel) );
                break;
         }
    }
});

bot.login(authKey);
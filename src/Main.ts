import Discord from "discord.js";
import auth from "../resources/auth.json";
import { mock } from "./utils/Mock";


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

bot.login(auth.token);
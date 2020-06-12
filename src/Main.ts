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
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        console.log(args);
        args = args.splice(1);
        console.log(args);
        switch(cmd) {
            case 'mock':
                msg.reply( mock( args.join(" ") ) );
                break;
            // Just add any case commands if you want to..
         }
    }
});

bot.login(auth.token);
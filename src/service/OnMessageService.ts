import Discord from "discord.js";
import { mock } from "../command/Mock";
import { insult } from "../command/Insult";
import { greentext } from "../command/Greentext";
import { crypto } from "../command/Crypto";

export function onMessage(client: Discord.Client){    

    client.on('message', (msg: Discord.Message)  => {
        if(msg.content[0] == "!"){
            let args = msg.content.substring(1).split(' ');
            let cmd = args[0];
            args = args.splice(1);
            switch(cmd) {
                case 'mock':
                    mock( msg, (msg.channel as Discord.TextChannel) );
                    break;
                case 'insult':
                    insult( msg, (msg.channel as Discord.TextChannel) );
                    break;
                case 'greentext':
                    greentext((msg.channel as Discord.TextChannel));
                    break;
                case 'crypto':
                    crypto((msg.channel as Discord.TextChannel), args);
                    break;
            }
        }
    });

}
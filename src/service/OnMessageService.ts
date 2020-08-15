import Discord from "discord.js";
import { mock } from "../command/Mock";
import { insult } from "../command/Insult";
import { greentext } from "../command/Greentext";
import { crypto } from "../command/Crypto";
import { PokeNerdService as pokeNerd, guessName } from "../service/PokeNerdService";

export function onMessage(client: Discord.Client) {

    client.on('message', (msg: Discord.Message) => {

        if(msg.author != client.user){
            pokeNerd(Math.random() * 100, msg.channel as Discord.TextChannel);
            guessName(msg.content, (msg.channel as Discord.TextChannel), msg.author.id);
        }

        if (msg.content[0] == "!") {
            let args = msg.content.substring(1).split(' ');
            let cmd = args[0];
            args = args.splice(1);
            switch (cmd) {
                case 'mock':
                    mock(msg, (msg.channel as Discord.TextChannel));
                    break;
                case 'insult':
                    insult(msg, (msg.channel as Discord.TextChannel));
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
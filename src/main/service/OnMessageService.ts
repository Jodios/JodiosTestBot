import Discord from "discord.js";
import { mock } from "../command/Mock";
import { insult } from "../command/Insult";
import { greentext } from "../command/Greentext";
import { clear } from "../command/Clear";
import { crypto } from "../command/Crypto";
import dubsChecker from "../command/DubsChecker";
import { dubsScoreBoard, dubsLeaderBoard, updateDubsTokens } from "../command/DubsChecker";
import { getRandomImageFromBoard } from "../command/ChanBoards";
import { PokeNerdService as pokeNerd, guessName, scoreBoard } from "../service/PokeNerdService";
import { quoteKingTerry } from "../command/KingTerry";
import { enterChat, leaveChat } from "../service/OnVoiceChangeService";
import path from "path";
import { FirebaseApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { UPDATE_TOKENS_INTERVAL } from "../resources/config";

const basePath = path.join(__dirname, "../resources");
const bideoName = "duke.mp4"
const maxLength = 40;

export function onMessage(client: Discord.Client, firebaseApp: FirebaseApp) {

    let storage: FirebaseStorage = getStorage(firebaseApp);
    let firestore: Firestore = getFirestore(firebaseApp);

    setInterval(() => { updateDubsTokens(firestore, client) }, UPDATE_TOKENS_INTERVAL * (1000 * 60 * 60) )
    // setInterval(() => { updateDubsTokens(firestore, client) }, 5000 )

    client.on('message', (msg: Discord.Message) => {

        let messageLength = msg.content.split(" ").length;
        if (messageLength >= maxLength) {
            msg.channel.send({ files: [path.join(basePath, bideoName)] });
        }

        if (msg.author != client.user) {
            pokeNerd(Math.random() * 1000, msg.channel as Discord.TextChannel, firestore, storage);
            guessName(msg.content, (msg.channel as Discord.TextChannel), msg.author, firestore);
        }

        if (msg.content[0] == "!") {
            let args = msg.content.substring(1).split(' ');
            let cmd = args[0];
            args = args.splice(1).filter(x => x !== "");
            switch (cmd.toLowerCase()) {
                case 'mock':
                    mock(msg, (msg.channel as Discord.TextChannel));
                    break;
                case 'insult':
                    insult(msg, (msg.channel as Discord.TextChannel));
                    break;
                case 'greentext':
                    greentext((msg.channel as Discord.TextChannel), storage);
                    break;
                case 'rng':
                    dubsChecker((msg.channel as Discord.TextChannel), msg.author, firestore);
                    break;
                case 'kingterry':
                    quoteKingTerry((msg.channel as Discord.TextChannel));
                    break;
                case 'crypto':
                    crypto((msg.channel as Discord.TextChannel), args);
                    break;
                case 'clear':
                    clear((msg.channel as Discord.TextChannel), (msg.member as Discord.GuildMember));
                    break;
                case 'wallpaper':
                    getRandomImageFromBoard((msg.channel as Discord.TextChannel), "/wg/");
                    break;
                case 'chan':
                    getRandomImageFromBoard((msg.channel as Discord.TextChannel), args[0] + "/");
                    break;
                case 'topkek':
                    enterChat(client, msg.member?.voice.channel, msg.channel as Discord.TextChannel);
                    break;
                case 'gtfo':
                    leaveChat(client, msg.guild as Discord.Guild, msg.channel as Discord.TextChannel);
                    break;
                case 'pokescore':
                    scoreBoard(msg.channel as Discord.TextChannel, firestore);
                    break;
                case 'dubsscore':
                    dubsScoreBoard(msg.channel as Discord.TextChannel, firestore, msg.author);
                    break;
                case 'dubsleaderboard':
                    dubsLeaderBoard(msg.channel as Discord.TextChannel, firestore);
                    break;
            }
        }
    });

}

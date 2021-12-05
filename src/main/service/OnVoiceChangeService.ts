import Discord, { VoiceState, VoiceChannel } from "discord.js";
import path from "path";

const ree = path.join(__dirname, "../resources", "ree.mp3");

let player: Discord.StreamDispatcher | undefined = undefined;

export const enterChat = (client: Discord.Client, voiceChannel: Discord.VoiceChannel | null | undefined, textChannel: Discord.TextChannel) => {

    joinChat(voiceChannel).then(connection => {

        client.on("guildMemberSpeaking", (user, speaking) => {
            if (speaking.bitfield == 1 && !player) {
                player = connection.play(ree, { "volume": 100 });
            } else if (speaking.bitfield == 0) {
                if (player) {
                    player.end();
                    player = undefined;
                }
            }
        });

    }).catch(reason => {
        textChannel.send(reason);
    });


}

export const leaveChat = (client: Discord.Client, guild: Discord.Guild, textChannel: Discord.TextChannel) => {
    if (guild.voice) {
        guild.voice.channel?.leave();
    } else {
        textChannel.send("I'm not even in voice chat, dumbass");
    }
}

async function joinChat(voiceChannel: Discord.VoiceChannel | null | undefined): Promise<Discord.VoiceConnection> {
    return new Promise(async (resolve, reject) => {
        try {
            if (voiceChannel) {
                let connection = await voiceChannel.join();
                resolve(connection);
            }
            else {
                reject("You have to be in a voice channel");
            }
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}



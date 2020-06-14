import Discord, { VoiceState, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core"

const joinn = "https://www.youtube.com/watch?v=ybGOT4d2Hs8";
const leavee = 'https://www.youtube.com/watch?v=5r06heQ5HsI';

export function onVoiceChange(client: Discord.Client){

    client.on("voiceStateUpdate", (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {

        let botMadeChange: boolean = newState.member?.user.username != client.user?.username;

        if( newState.channel?.members.size == undefined && botMadeChange){
            playTheme(oldState.channel as Discord.VoiceChannel, leavee);
        }else if(botMadeChange){
            playTheme(newState.channel as Discord.VoiceChannel, joinn);
        }

    })

}

async function playTheme(voiceChannel: Discord.VoiceChannel, soundUrl: string){

    let connection = await voiceChannel.join();

    let dispatcher =  connection.play(ytdl(soundUrl, { filter: 'audioonly' } ))
    dispatcher.on('finish', () => {
        voiceChannel.leave();
        dispatcher.destroy();
    });
    
}
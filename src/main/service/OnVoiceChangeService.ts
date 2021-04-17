import Discord, { VoiceState, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core"

const joinn = ["https://www.youtube.com/watch?v=ybGOT4d2Hs8"];
const leavee = ['https://www.youtube.com/watch?v=5r06heQ5HsI','https://www.youtube.com/watch?v=XsoNZ_RfJSk'];

export function onVoiceChange(client: Discord.Client){

    client.on("voiceStateUpdate", (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {

        let botMadeChange: boolean = newState.member?.user.username == client.user?.username;
        let mute: boolean = (newState.selfMute! != oldState.selfMute!) || (newState.mute! != oldState.mute!);
        let rnjoin = Math.floor(Math.random() * joinn.length)
        let rnleave = Math.floor(Math.random() * leavee.length)

        if( newState.channel?.members.size == undefined && !botMadeChange){
            playTheme(oldState.channel as Discord.VoiceChannel, leavee[rnleave]);
        }else if(!botMadeChange && !mute){
            playTheme(newState.channel as Discord.VoiceChannel, joinn[rnjoin]);
        }

    })

}

async function playTheme(voiceChannel: Discord.VoiceChannel, soundUrl: string){

    try {
        let connection = await voiceChannel.join();
    
        let dispatcher =  connection.play(ytdl(soundUrl, { filter: 'audioonly' } ))
        dispatcher.on('finish', () => {
            voiceChannel.leave();
            dispatcher.destroy();
        });
    } catch (error) {
        console.log(error);
    }
    
}
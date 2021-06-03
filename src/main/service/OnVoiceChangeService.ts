import Discord, { VoiceState, VoiceChannel } from "discord.js";
import path from "path";

const joinn = ["https://www.youtube.com/watch?v=ybGOT4d2Hs8"];
const leavee = ['https://www.youtube.com/watch?v=5r06heQ5HsI','https://www.youtube.com/watch?v=XsoNZ_RfJSk'];
const basePath = path.join(__dirname, "../resources");
//@ts-ignore
let player: Discord.StreamDispatcher = undefined;

export const onVoiceChange = (client: Discord.Client, connection: Discord.VoiceConnection) => {

    client.on("guildMemberSpeaking", (user, speaking) => {
        let x = 2; 
        if(speaking.bitfield == 1){
            player = connection.play(path.join(basePath, "ree.mp3"), {"volume": 1});
        }else{
            if(player){
                 player.end();
            }
        } 
    });

}
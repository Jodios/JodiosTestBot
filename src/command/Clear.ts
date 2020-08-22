import Discord from "discord.js";

export async function clear(channel: Discord.TextChannel){
    
    channel.send("in clear");

}

function onError(err: Error){
    console.log(err.message);
}




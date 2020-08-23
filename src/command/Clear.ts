import Discord from "discord.js";

export async function clear(channel: Discord.TextChannel, user: Discord.GuildMember){
    
    if (user.hasPermission("ADMINISTRATOR")){
        channel.send(`${user.nickname} is an Admin`);
    }else{
        channel.send(`${user.nickname} is a normal`);
    }

}

function onError(err: Error){
    console.log(err.message);
}




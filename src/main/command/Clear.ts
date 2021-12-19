import Discord from "discord.js";

export async function clear(channel: Discord.TextChannel, user: Discord.GuildMember) {

    if (user.hasPermission("ADMINISTRATOR")) {
        channel.messages.fetch().then((messages: Discord.Collection<string, Discord.Message>) => {
            messages.forEach((message: Discord.Message) => {
                message.delete().catch(onError);
            })
            channel.send(`${user.nickname == null ? user.displayName : user.nickname} has deleted all messages.`);
        })
    } else {
        channel.send(`${user.nickname == null ? user.displayName : user.nickname} doesn't have permissions to delete messages.`);
    }

}
function onError(err: Error) {
    console.log(err.message);
}




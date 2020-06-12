import Discord from "discord.js";

export async function mock(cmdMsg: Discord.Message, channel: Discord.TextChannel ) {
    let name = "";
    let message = "";
    if(cmdMsg.mentions.users.array().length == 0){
        channel.send(" Who are we mocking? ")
        return;
    }else{
        name = cmdMsg.mentions.users.array()[0].username;
    }
    await channel.messages.fetch().then( (messages: Discord.Collection<string, Discord.Message>) => {
        messages.array().forEach( (msg: Discord.Message) => {
            if(msg.author.username == name){
                message = message == "" ? msg.content : message;
            }
        })
    })

    for (let i = 0; i < message.length; i++) {
        if (i % (Math.round(Math.random() * 4)) == 0) {
            message = message.substr(0, i) + (message[i].toUpperCase()) + message.substr(i + 1);
        } else {
            message = message.substr(0, i) + (message[i].toLowerCase()) + message.substr(i + 1);
        }
    }
    channel.send(message);

}
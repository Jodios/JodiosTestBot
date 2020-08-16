import Discord from "discord.js";

export async function spam(user: Discord.User){

    console.log(`sending a message to ${user}`);
    for (let i = 0; i < 100; i++){
        user.send("hi");
        await pause(1);
    }

}

function sendMessage(user: Discord.User){
    user.send("hi");
}

function onError(err: Error){
    console.log(err.message);
}

async function pause(sec: number){
    return new Promise( (resolve, rejcet) => setTimeout(resolve, sec * 1000) );
}



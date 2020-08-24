import Discord from "discord.js";

const defaultMessage:string = "HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO";

export async function spam(user: Discord.User, message: string){
    let actualMessage:string = (message == "") ? defaultMessage : message;
    console.log(`sending a message to ${user}`);
    for (let i = 0; i < 100; i++){
        user.send( actualMessage ).catch(onError);
        await pause(1);
    }

}

function onError(err: Error){
    console.log(err.message);
}
 
async function pause(sec: number){
    return new Promise( (resolve, rejcet) => setTimeout(resolve, sec * 1000) );
}




// https://insult.mattbas.org

import Discord from "discord.js";
import axios from "axios";

const replace_string = "REPLACE_NAME"
const baseurl = "https://insult.mattbas.org";
const templates = [
    "/api/insult.json?template=You+are+as+%3Cadjective%3E+as+%3Carticle+target%3Dadj1%3E+%3Cadjective+min%3D1+max%3D3+id%3Dadj1%3E+%3Camount%3E+of+%3Cadjective+min%3D1+max%3D3%3E+%3Canimal%3E+%3Canimal_part%3E",
    "/api/insult.json?template=%3Cadjective%3E+looking+ass",
    "/api/insult.json?lang=en&type=txt&who=REPLACE_NAME"
]


export function insult(msg: Discord.Message, channel: Discord.TextChannel){

    if(msg.mentions.users.array().length == 0){
        channel.send(" Who are we insulting? ")
        return;
    }
    
    let rn = Math.floor(Math.random() * templates.length)
    let name = msg.mentions.users.array()[0].username;
    let url = `${baseurl}${templates[rn]}`

    let options: Discord.MessageOptions = {
        allowedMentions:{
            users: [name]
        }
    }

    console.log(url);
    axios.get(url).then(x => {
        let insult = x.data.insult.replace(replace_string, `<@${msg.mentions.users.array()[0].id}>` );
        channel.send(insult);
    }).catch(onError);


}

function onError(err: Error){
    console.log(err.message);
}



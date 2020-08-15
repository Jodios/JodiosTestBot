import Discord from "discord.js";
import axios from "axios";

const url = "https://pokeapi.co/api/v2/pokemon/";
let time = new Date().getTime();
let actualName = "";

export function PokeNerdService(n: number, channel: Discord.TextChannel) {
    if ( 45 < n && n < 55){
        
        let pokeURL = `${url}${Math.floor(Math.random() * 1000 + 1)}`;
        axios.get(pokeURL).then(res => {
    
            actualName = res.data.forms[0].name;
            let image = res.data.sprites.front_default;
            channel.send("Who's that pokemon?", { files: [image] });
            console.log(actualName);
    
        }).catch(err => onFailed(err, pokeURL));

    }
}

export function guessName(guess: string, channel: Discord.TextChannel, user: string) {
    let sec: number = ((new Date().getTime()) - time) / 1000;
    let min: number = sec / 60;
    if (min < 1 && ( actualName.toLowerCase() ) == guess.toLowerCase() ){
        channel.send(`<@${user}> you fucking nerd` );
    }
}

function onFailed(err: Error, url: string) {
    console.log(err.message);
    console.log(url);
}
import Discord from "discord.js";
import axios from "axios";

const url = "https://pokeapi.co/api/v2/pokemon/";
let time = new Date().getTime();
let actualName = "";
let guessed = false;
const insults: string[] = [
  "You fucking nerd.", "What a nerd",
  "Wow! You actually guessed it correctly, you incredibly sad, weird nerd. ",
  "How did you get that? Do you live with your parents? Are you really just a big enough " +
  "loser that you actually know the names of these pokemon by heart? What is wrong with you?"
];

export function PokeNerdService(n: number, channel: Discord.TextChannel) {
  if (500 < n && n < 550) {
    let pokeURL = `${url}${Math.floor(Math.random() * 806 + 1)}`;
    axios
      .get(pokeURL)
      .then((res) => {
        time = new Date().getTime();
        actualName = res.data.forms[0].name;
        let image = res.data.sprites.front_default;
        channel.send("Who's that pokemon?", { files: [image] });
        console.log(actualName);
        guessed = false;
      })
      .catch((err) => onFailed(err, pokeURL));
  }
}

export function guessName(
  guess: string,
  channel: Discord.TextChannel,
  user: string
) {
  let sec: number = (new Date().getTime() - time) / 1000;
  let min: number = sec / 60;
  if ( min < 1 && actualName.toLowerCase() == guess.toLowerCase() && !guessed) {
    let rn = Math.ceil(Math.random() * insults.length - 1);
    channel.send(`<@${user}> ${insults[rn]}`);
    guessed = true;
  }
}

function onFailed(err: Error, url: string) {
  console.log(err.message);
  console.log(url);
}

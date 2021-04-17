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

/** 
 * This method is called any time a message is sent.
 * n is a random number from 0 - 1000
 * if the 500 < n < 550 then a pokemon will spawn.
 * P(PokeSpawn) = (48/1000)*100 ~= 4.8%
 * about 1 pokemon per 20 messages.
*/
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

/** 
 * This method is called any time a message is sent.
 * It first checks if the time difference from when the pokemon
 * spawned and the time of the guess is less than 1
 * and then checks if the guess is correct and if the correct
 * answer has already been guessed with the guessed variable
*/
export function guessName(
  guess: string,
  channel: Discord.TextChannel,
  user: string
) {
  let sec: number = (new Date().getTime() - time) / 1000;
  let min: number = sec / 60;
  if (min < 1 && actualName.toLowerCase() == guess.toLowerCase() && !guessed) {
    let rn = Math.ceil(Math.random() * insults.length - 1);
    channel.send(`<@${user}> ${insults[rn]}`);
    guessed = true;
  }
}

function onFailed(err: Error, url: string) {
  console.log(err.message);
  console.log(url);
}

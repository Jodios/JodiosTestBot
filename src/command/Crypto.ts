import Discord from "discord.js";
const CoinGecko = require("coingecko-api");

const url = "https://www.reddit.com/r/greentext.json?count=10";
const coingeckoClient = new CoinGecko();

export async function crypto(channel: Discord.TextChannel, args: string[]) {
    if (args.length > 1 || args.length == 0){
        channel.send("Invalid currency");
        return;
    }

    let x = await coingeckoClient.ping()

    console.log(x);

}

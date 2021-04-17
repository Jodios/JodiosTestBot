import Discord from "discord.js";
const CoinGecko = require("coingecko-api");

const coingeckoClient = new CoinGecko();

export async function crypto(channel: Discord.TextChannel, args: string[]) {
    if (args.length > 1 || args.length == 0){
        channel.send("Invalid currency");
        return;
    }

    // @ts-ignore
    let data = await (coingeckoClient.coins.all());
    data = (data['data']).filter((x:any) => x.symbol == args[0])[0];

    if(data == undefined){
        channel.send("No matches for that coin");
        return;
    }
    // let msg = {
    //     "name": data.name,
    //     "price": data.market_data.current_price
    // }
    let msg = `${data.name} is $${data.market_data.current_price.usd}`;
    channel.send(msg);

}
import Discord from "discord.js";
const CoinGecko = require("coingecko-api");
import axios from "axios";


const plotURL = "https://graphing.jodios.com/simpleGraph"

const coingeckoClient = new CoinGecko();


export async function crypto(channel: Discord.TextChannel, args: string[]) {
    if (args.length > 1 || args.length == 0) {
        channel.send("Invalid currency");
        return;
    }

    let coin = args[0];

    let data = await coingeckoClient.coins.fetchMarketChart(coin, {
        days: 2
    });
    
    data = data.data.prices.map((i: number[]) => i[1]);

    let imageBuffer: Buffer = await createGraph(data, channel, coin);
    data = await coingeckoClient.simple.price({
        ids: [coin],
        vs_currencies: ['usd']
    });
    let currentPrice = data['data'][coin].usd;
    channel.send(`The current price of ${coin} is $${currentPrice}`, { files: [imageBuffer] })

}

const createGraph = async (yAxis: number[], channel: Discord.TextChannel, coin: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {

        let xAxis: number[] = []
        for (let i = 0; i < yAxis.length; i++) {
            xAxis.push(i + 1);
        }
        let data =  {'y': yAxis, 'x': xAxis, 'coin': coin, 'time': 45};
        axios.post(plotURL, data, {responseType: 'arraybuffer'}).then( (data) => {
            resolve( Buffer.from(data.data, 'binary') )
        } ).catch( (err) => {
            reject(err);
        })


})}
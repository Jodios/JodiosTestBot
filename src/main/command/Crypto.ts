import Discord from "discord.js";
import { Stream } from "stream";
const CoinGecko = require("coingecko-api");
const plotly = require('plotly')("Jodios", process.env.plotlyToken);


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

    let imageBuffer: Buffer = await createGraph(data, channel);
    data = await coingeckoClient.simple.price({
        ids: [coin],
        vs_currencies: ['usd']
    });
    let currentPrice = data['data'][coin].usd;
    channel.send(`The current price of ${coin} is $${currentPrice}`, { files: [imageBuffer] })

}

const createGraph = async (yAxis: number[], channel: Discord.TextChannel): Promise<Buffer> => {
    return new Promise((resolve, reject) => {

        let xAxis: number[] = []
        for (let i = 0; i < yAxis.length; i++) {
            xAxis.push(i + 1);
        }

        const figure = { data: [{ x: xAxis, y: yAxis, type: "line" }] };
        var imgOpts = {
            format: 'png',
            width: 1000,
            height: 500
        };

        plotly.getImage(figure, imgOpts, (err: any, imageStream: Stream) => {
            if (err) reject(err);
            var buffers: Buffer[] = [];
            imageStream.on('data', (buff) => {
                buffers.push(buff);
            })
            imageStream.on('end', () => {
                resolve(Buffer.concat(buffers));
            })
        })

    })
}
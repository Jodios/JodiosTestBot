import Discord from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Storage } from "firebase-admin/storage";
import { setInterval } from "timers";

var url = `https://api.pushshift.io/reddit/search/submission/?subreddit=greentext&sort=desc&sort_type=created_utc&size=1000`;

class Greentext {
    comment: string = '';
    fileName: string = '';
    buffer: any = null;
}

let cache: any[] = []

/**
 * greentext is called from @OnMessageService 
 * Sends a request to reddit for /r/greentext
 * @param channel 
 * @param storage 
 * @param allowedRetries the number of times we're allowed to retry posting a greentext
 */
export async function greentext(channel: Discord.TextChannel, storage: Storage, allowedRetries: number) {
    if (cache.length == 0){
        await cacheGreentexts()
    }
    getRandomGreentext(allowedRetries).then((res: Greentext) => {
        let file = storage.bucket().file(`jodiostestbot/greentext/${res.fileName}`);
        file.save(res.buffer).then(async () => {
            await file.makePublic();
            channel.send(`${res.comment}`, new Discord.MessageAttachment(res.buffer, res.fileName));
        }).catch(err => onFailed(err.message, channel));
    }).catch(err => onFailed(err, channel));
}

/**
 * invoked by greentext on successful request
 * to reddit. Generates a random number based on the length
 * of posts provided by reddit and returns that picture.
 * @param data 
 */
function getRandomGreentext(allowedRetries: number): Promise<Greentext> {
    return new Promise((resolve, reject) => {
        if (allowedRetries <= 0){
            return reject("Greentext command is out of retries.");
        }
        let greentextResult = new Greentext;

        let randomNumber = Math.ceil(Math.random() * cache.length - 1);
        let randomImageUrl = cache[randomNumber]['link'];
        greentextResult.comment = cache[randomNumber]['comment'];

        // @ts-ignore
        let extension = randomImageUrl.split("\/").filter((val, index) => val !== "")[2].split(".")[1];
        let name = Math.floor(new Date().getTime() / 1000);
        greentextResult.fileName = `${name}.${extension}`;
        
        // Deleting the image so you don't get repeats. 
        cache.splice(randomNumber, 1);

        console.log(`Getting image from: ${randomImageUrl}`);
        axios.get(randomImageUrl, { responseType: 'arraybuffer' }).then(axiosResult => {
            greentextResult.buffer = Buffer.from(axiosResult.data, "utf-8");
            return resolve(greentextResult);
        }).catch(err => {
            if (err.response.status == 404) {
                getRandomGreentext(--allowedRetries)
                    .then(res => resolve(res))
                    .catch(message => reject(message));
            }
            else
                reject(err.message);
        }); 
    });
}

function onFailed(message: string, channel: Discord.TextChannel) {
    console.log(message);
    channel.send(message);
}

const cacheGreentexts = async() => {
    await axios.get(url)
        .then((res) => {
            cache = res.data.data;
            cache = cache.map((post: any) => { return { link: post?.url, comment: post?.title } });
            cache = cache.filter(u => u.link.includes("i.redd.it"));
        })
        .catch(err => console.log(err));
}

// calling it once when application starts 
cacheGreentexts();
// Refreshes every 3 hours
setInterval( cacheGreentexts, 10800000 )
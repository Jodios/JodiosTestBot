import Discord from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Storage } from "firebase-admin/storage";

var url = `https://api.pushshift.io/reddit/search/submission/?subreddit=greentext&sort=desc&sort_type=created_utc&size=1000`;

class Greentext {
    comment: string = '';
    fileName: string = '';
    buffer: any = null;
}

/**
 * greentext is called from @OnMessageService 
 * Sends a request to reddit for /r/greentext
 * @param channel 
 * @param storage 
 * @param allowedRetries the number of times we're allowed to retry posting a greentext
 */
export async function greentext(channel: Discord.TextChannel, storage: Storage, allowedRetries: number) {
    axios.get(url).then((res) => {
        getRandomGreentext(res.data.data, allowedRetries).then((res: Greentext) => {
            let file = storage.bucket().file(`jodiostestbot/greentext/${res.fileName}`);
            file.save(res.buffer).then(async() => {
                await file.makePublic();
                channel.send(res.comment, new Discord.MessageAttachment(res.buffer, res.fileName));
            }).catch(err => onFailed(err.message, channel));
        }).catch(err => onFailed(err, channel));
    }).catch(err => onFailed(err.message, channel));
}

/**
 * invoked by greentext on successful request
 * to reddit. Generates a random number based on the length
 * of posts provided by reddit and returns that picture.
 * @param data 
 */
function getRandomGreentext(data: any, allowedRetries: number): Promise<Greentext> {
    return new Promise((resolve, reject) => {
        if (allowedRetries <= 0){
            reject("Greentext command is out of retries.");
            return;
        }
        let greentextResult = new Greentext;
        let urls: { link: string, comment: string }[] = data.map((post: any) => { return { link: post?.url, comment: post?.title } });
        urls = urls.filter(u => u.link.includes("i.redd.it"));

        let randomNumber = Math.ceil(Math.random() * urls.length - 1);
        let randomImageUrl = urls[randomNumber]['link'];
        greentextResult.comment = urls[randomNumber]['comment'];

        let extension = randomImageUrl.split("\/").filter((val, index) => val !== "")[2].split(".")[1];
        let name = Math.floor(new Date().getTime() / 1000);
        greentextResult.fileName = `${name}.${extension}`;
        // let reference: StorageReference = ref(storage, `/jodiostestbot/greentext/${name}.${extension}`);

        console.log(`Getting image from: ${randomImageUrl}`);
        axios.get(randomImageUrl, { responseType: 'arraybuffer' }).then(axiosResult => {
            greentextResult.buffer = Buffer.from(axiosResult.data, "utf-8");
            resolve(greentextResult);
        }).catch(err => {
            if (err.response.status == 404)
                getRandomGreentext(data, --allowedRetries)
                .then(res => resolve(res))
                .catch(message => reject(message));
            else
                reject(err.message);
        }); // not sure if this catch is necessary
    });
}

function onFailed(message: string, channel: Discord.TextChannel) {
    console.log(message);
    channel.send(message);
}
import Discord from "discord.js";
import axios, { AxiosResponse } from "axios";
import { FirebaseStorage, StorageReference, uploadBytes, ref } from "firebase/storage";

var url = `https://api.pushshift.io/reddit/search/submission/?subreddit=greentext&sort=desc&sort_type=created_utc&size=1000`;

/**
 * greentext is called from @OnMessageService 
 * Sends a request to reddit for /r/greentext
 * @param channel 
 */
export async function greentext(channel: Discord.TextChannel, storage: FirebaseStorage) {
    axios.get(url).then(res => onSuccess(res, channel, storage)).catch(onFailed);
}

/**
 * onSuccess invoked by greentext on successful request
 * to reddit. Generates a random number based on the length
 * of posts provided by reddit and returns that picture.
 * @param response 
 * @param channel 
 */
async function onSuccess(response: AxiosResponse, channel: Discord.TextChannel, storage: FirebaseStorage) {
    let data = response.data.data;
    let urls: { link: string, comment: string }[] = data.map((post: any) => { return { link: post?.url, comment: post?.title } });
    urls = urls.filter(u => u.link.includes("i.redd.it"))
    let rn = Math.ceil(Math.random() * urls.length - 1)
    let randomUrl = urls[rn]['link'];
    let comment = urls[rn]['comment']

    let extension = randomUrl.split("\/").filter((val, index) => val !== "")[2].split(".")[1];
    let name = Math.floor(new Date().getTime() / 1000);
    let reference: StorageReference = ref(storage, `/jodiostestbot/greentext/${name}.${extension}`);
    
    console.log(`Getting image from: ${randomUrl}`);
    axios.get(randomUrl, {responseType: 'arraybuffer'}).then(res => {
        let buffer = Buffer.from(res.data, "utf-8");
        uploadBytes(reference, buffer).then(value => {
            let attachement = new Discord.MessageAttachment(buffer, `${name}.${extension}`)
            channel.send(comment, attachement);
        }).catch(onFailed);
    }).catch(onFailed);

}

function onFailed(err: Error) {
    console.log(err.message);
}
import Discord from "discord.js";
import axios, { AxiosResponse } from "axios";

var url = `https://api.pushshift.io/reddit/search/submission/?subreddit=greentext&sort=desc&sort_type=created_utc&size=1000`;

/**
 * greentext is called from @OnMessageService 
 * Sends a request to reddit for /r/greentext
 * @param channel 
 */
export async function greentext(channel: Discord.TextChannel) {
    axios.get(url).then(res => onSuccess(res, channel)).catch(onFailed);
}

/**
 * onSuccess invoked by greentext on successful request
 * to reddit. Generates a random number based on the length
 * of posts provided by reddit and returns that picture.
 * @param response 
 * @param channel 
 */
async function onSuccess(response: AxiosResponse, channel: Discord.TextChannel) {
    let data = response.data.data;
    let urls: [] = data.map((post: any) => { return { link: post?.url, comment: post?.title } });
    let rn = Math.ceil(Math.random() * urls.length - 1)
    let randomUrl = urls[rn]['link'];
    let comment = urls[rn]['comment']

    console.log(`Getting image from: ${randomUrl}`);
    channel.send(comment, { files: [randomUrl] });
}

function onFailed(err: Error) {
    console.log(err.message);
}
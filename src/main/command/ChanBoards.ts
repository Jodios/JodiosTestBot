import Discord from "discord.js";
import axios, { AxiosResponse } from "axios";

let baseUrl = "https://a.4cdn.org";
let imageBaseUrl = "https://i.4cdn.org";

export async function getRandomImageFromBoard(channel: Discord.TextChannel, board: string) {
    console.log(board);

    let randomPage = Math.ceil(Math.random() * 10);
    let url = baseUrl + board + randomPage + ".json"
    axios.get(url).then(res => onSuccessfulGetThreads(res, channel, board)).catch(onError);

}

async function onSuccessfulGetThreads(response: AxiosResponse, channel: Discord.TextChannel, board: string) {
    let data = response.data;
    let threads: [] = data.threads!;
    let randomThread = Math.ceil(Math.random() * threads.length)
    let threadNumber = threads[randomThread]['posts'][0]['no'];
    let threadUrl = baseUrl + board + "thread/" + threadNumber + ".json";
    axios.get(threadUrl).then(res => onSuccessfulGetPosts(res, channel, board, threadNumber)).catch(onError);
}

async function onSuccessfulGetPosts(response: AxiosResponse, channel: Discord.TextChannel, board: string, threadNumber: string) {
    let data = response.data;
    let posts: [] = data.posts!;
    //@ts-ignore
    posts = posts.filter(post => post['filename'] != undefined && post['tim'] != undefined && post['ext'] != undefined);
    let randomPost = posts[Math.floor(Math.random() * posts.length)]
    let imageUrl = imageBaseUrl + board + randomPost['tim'] + randomPost['ext'];
    console.log(`Getting image from: ${imageUrl}`);
    channel.send("https://boards.4chan.org" + board + "thread/" + threadNumber, { files: [imageUrl] });
}

function onError(err: Error) {
    console.log(err.message);
}

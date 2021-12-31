import Discord from "discord.js";
import path from "path";
import jimp from "jimp";
import { rollingAdmins, MAX_FREE_TOKENS, FREE_TOKEN_INCREMENT, DUBS_SCORING } from "../resources/config.json";
import { Firestore, DocumentReference, DocumentData, CollectionReference, QuerySnapshot } from "firebase-admin/firestore";

const basePath = path.join(__dirname, "../resources");
const min = 10000000
const max = 99999999
const repeatingDigitsMap: { [key: number]: string } = {
    2: "dubs", 3: "trips", 4: "quads", 5: "quints"
}
var cache = {}

export default async function dubsChecker(channel: Discord.TextChannel, user: Discord.User, firestore: Firestore) {
    let docRef: DocumentReference<DocumentData> = firestore.doc(`scoreBoards/dubs/${channel.guild}/${user.id}`)

    // @ts-ignore
    if (!(channel.guild.id in cache) || !(user.id in cache[channel.guild.id])) {
        if(!(channel.guild.id in cache)){
            // @ts-ignore
            cache[channel.guild.id] = {};
            // @ts-ignore
            cache[channel.guild.id][user.id] = {};
        }
        let loadedDoc = await docRef.get();
        
        if(loadedDoc.exists){
            // @ts-ignore
            cache[channel.guild.id][user.id] = loadedDoc.data();
        }else{
            // @ts-ignore
            cache[channel.guild.id][user.id] = { name: user.username, iconUrl: user.avatarURL, tokens: 10, score: 0 };
        }

    }
    // @ts-ignore
    if(cache[channel.guild.id][user.id]['tokens'] === 0){
        channel.send(`<@${user.id}> Just stop`);
        return;
    }
    var loadedImage: jimp;
    let rn = Math.floor(Math.random() * (max - min + 1) + min);
    let dubs = checkRepeatingDigits(rn);
    if (!dubs && user.username in rollingAdmins) {
        //@ts-ignore
        for (var i = 0; i < rollingAdmins[user.username]; i++) {
            rn = Math.floor(Math.random() * (max - min + 1) + min);
            dubs = checkRepeatingDigits(rn);
            if (dubs) break;
        }
    }
    // @ts-ignore
    cache[channel.guild.id][user.id]['tokens']--;
    if (dubs) {
        jimp.read(path.join(basePath, 'dubs_2.jpg')).then((image) => {
            loadedImage = image;
            return jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        }).then((font) => {
            loadedImage.print(font, 680, 10, rn).getBuffer(jimp.MIME_PNG, (err, buffer) => {
                channel.send(`${dubs} check em`, { files: [buffer] });
            })
        })
            
        // @ts-ignore
        let data = cache[channel.guild.id][user.id];
        // @ts-ignore
        data['tokens'] += DUBS_SCORING[dubs].tokenReward;
        data['iconUrl'] = user.avatarURL();
        // @ts-ignore
        data['score'] += DUBS_SCORING[dubs].score;
        if (dubs in data) {
            data[dubs]++;
        } else {
            data[dubs] = 1;
        }
        // @ts-ignore
        cache[channel.guild.id][user.id] = data;
        docRef.set(data)
    } else {
        // @ts-ignore
        docRef.set(cache[channel.guild.id][user.id])
        channel.send(rn);
    }
}

export const checkRepeatingDigits = (n: number): string => {

    let consecutiveDigits = 0;
    let previous = n % 10;
    n = Math.floor(n / 10);
    let current = 0;

    while (n > 0) {
        current = n % 10;
        if (current == previous) consecutiveDigits += 1;
        else break;
        previous = current;
        n = Math.floor(n / 10);
    }
    consecutiveDigits = consecutiveDigits > 0 ? consecutiveDigits + 1 : 0;
    return repeatingDigitsMap[consecutiveDigits];
}

export const dubsScoreBoard = async (channel: Discord.TextChannel, firestore: Firestore, user: Discord.User) => {
    let userScore: DocumentReference<DocumentData> = firestore.doc(`scoreBoards/dubs/${channel.guild}/${user.id}`);
    userScore.get().then(snapshot => {
        if (!snapshot.exists) {
            return;
        }
        var fields: Discord.EmbedFieldData[] = [];
        for (const k in snapshot.data()) {
            if (k === "name" || k === "iconUrl" || k === "tokens" || k === "score") continue;
            fields.push({ name: k, value: snapshot.data()![k] })
        }
        var embed = new Discord.MessageEmbed().setColor(0x4286f4);
        embed.setAuthor(snapshot.data['name'], snapshot.data()!['iconUrl'], snapshot.data()!['iconUrl'])
        embed.addField("Score: ", snapshot.data()!['score'], true);
        embed.addFields(fields)
        embed.setFooter(`Tokens remaining: ${snapshot.data()!['tokens']}`);
        channel.send(embed);
        return embed;
    }).catch(reason => {
        console.log(reason)
    })
}

export const dubsLeaderBoard = async (channel: Discord.TextChannel, firestore: Firestore) => {
    let collectionRef: CollectionReference<DocumentData> = firestore.collection(`scoreBoards/dubs/${channel.guild}`);
    let collectionSnapshot: QuerySnapshot<DocumentData> = await collectionRef.get();
    collectionSnapshot.docs.sort((a, b) => (a.data()['score'] < b.data()['score']) ? 1 : -1).map(user => {
        var fields: Discord.EmbedFieldData[] = []
        for (const k in user.data()) {
            if (k === "name" || k === "iconUrl" || k === "tokens" || k === "score") continue;
            fields.push({ name: k, value: user.data()[k] })
        }
        var embed = new Discord.MessageEmbed().setColor(0x4286f4);
        embed.setAuthor(user.data()['name'], user.data()['iconUrl'], user.data()['iconUrl'])
        embed.addField("Score: ", user.data()['score'], true);
        embed.addFields(fields)
        embed.setFooter(`Tokens remaining: ${user.data()['tokens']}`);
        channel.send(embed)
        return embed;
    })
}

export const updateDubsTokens = async (firestore: Firestore, client: Discord.Client) => {
    console.log(`Checking for tokens at ${new Date()}`)
    // checking if it's between 11PM and 1AM
    var now = new Date().getHours();
    if( !(now >= 23) && !(now <= 1) ) {
        return;
    }
    cache = {};
    client.guilds.cache.forEach(guild => {
        var collectionRef: CollectionReference<DocumentData> = firestore.collection(`scoreBoards/dubs/${guild.id}`);
        collectionRef.get().then(document => {

            document.forEach(user => {

                if (user.data()['tokens'] < MAX_FREE_TOKENS) {
                    var data = user.data();
                    var docRef = firestore.doc(`/scoreBoards/dubs/${guild.id}/${user.id}`);
                    data.tokens += FREE_TOKEN_INCREMENT;
                    docRef.set(data);
                }

            })

        })
    })

}






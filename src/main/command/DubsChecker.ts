import Discord from "discord.js";
import path from "path";
import jimp from "jimp";
import { rollingAdmins } from "../resources/config";
import { Firestore, doc, DocumentReference, DocumentData, setDoc, getDoc, CollectionReference, QuerySnapshot, collection, getDocs } from "firebase/firestore";

const basePath = path.join(__dirname, "../resources");
const min = 10000000
const max = 99999999
const repeatingDigitsMap: { [key: number]: string } = {
    2: "dubs", 3: "trips", 4: "quads", 5: "quints"
}

export default async function dubsChecker(channel: Discord.TextChannel, user: Discord.User, firestore: Firestore) {
    let docRef: DocumentReference<DocumentData> = doc(firestore, `scoreBoards/dubs/${channel.guild}/${user.id}`)
    var loadedImage: jimp;
    let rn = Math.floor(Math.random() * (max - min + 1) + min);
    let dubs = checkRepeatingDigits(rn);
    if (dubs && user.username in rollingAdmins) {
        for (var i = 0; i < rollingAdmins[user.username]; i++) {
            rn = Math.floor(Math.random() * (max - min + 1) + min);
            dubs = checkRepeatingDigits(rn);
            if (dubs) break;
        }
    }
    if (dubs) {
        jimp.read(path.join(basePath, 'dubs_2.jpg')).then((image) => {
            loadedImage = image;
            return jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        }).then((font) => {
            loadedImage.print(font, 680, 10, rn).getBuffer(jimp.MIME_PNG, (err, buffer) => {
                channel.send(`${dubs} check em`, { files: [buffer] });
            })
        })
        getDoc(docRef).then(docSnapshot => {
            if (docSnapshot.exists()) {
                let data = docSnapshot.data();
                if (dubs in data) {
                    data[dubs] = data[dubs] + 1;
                } else {
                    data[dubs] = 1;
                }
                setDoc(docRef, data);
            } else {
                setDoc(docRef, { [dubs]: 1, name: user.username, iconUrl: user.avatarURL })
            }
        });
    } else {
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
    let userScore: DocumentReference<DocumentData> = doc(firestore, `scoreBoards/dubs/${channel.guild}/${user.id}`);
    getDoc(userScore).then(snapshot => {
        if(!snapshot.exists()){
            return;
        }
        var fields: Discord.EmbedFieldData[] = [];
        for (const k in snapshot.data()) {
            if (k === "name" || k === "iconUrl") continue;
            fields.push({ name: k, value: snapshot.data()[k] })
        }
        var embed = new Discord.MessageEmbed().setColor(0x4286f4);
        embed.setAuthor(snapshot.data()['name'], snapshot.data()['iconUrl'], snapshot.data()['iconUrl'])
        embed.addFields(fields)
        channel.send(embed)
        return embed;
    })
}

export const dubsLeaderBoard = async (channel: Discord.TextChannel, firestore: Firestore) => {
    let collectionRef: CollectionReference<DocumentData> = collection(firestore, `scoreBoards/dubs/${channel.guild}`);
    let collectionSnapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
    collectionSnapshot.docs.sort((a, b) => (a.data()['score'] < b.data()['score']) ? 1 : -1).map(user => {
        var fields: Discord.EmbedFieldData[] = []
        for (const k in user.data()) {
            if (k === "name" || k === "iconUrl") continue;
            fields.push({ name: k, value: user.data()[k] })
        }
        var embed = new Discord.MessageEmbed().setColor(0x4286f4);
        embed.setAuthor(user.data()['name'], user.data()['iconUrl'], user.data()['iconUrl'])
        embed.addFields(fields)
        channel.send(embed)
        return embed;
    })
}
import Discord from "discord.js";
import path from "path";
import jimp from "jimp";
import { getFirestore, Firestore, doc, DocumentReference, DocumentData, setDoc, getDoc, CollectionReference, QuerySnapshot, collection, getDocs } from "firebase/firestore";

const basePath = path.join(__dirname, "../resources");
const min = 10000000
const max = 99999999

export default async function dubsChecker(channel: Discord.TextChannel, user: Discord.User, firestore: Firestore) {
    let docRef: DocumentReference<DocumentData> = doc(firestore, `scoreBoards/dubs/${channel.guild}/${user.id}`)
    var loadedImage: jimp;
    let rn = Math.floor(Math.random() * (max - min+1)+min);
    let dubs = checkRepeatingDigits(rn);
    if(dubs === "" && user.username==="jodios"){
        for(var i = 0; i < 6; i++){
            rn = Math.floor(Math.random() * (max - min+1)+min); 
            dubs = checkRepeatingDigits(rn);
            if(dubs!=="") break;
        }
    }
    if(dubs != ""){
        jimp.read(path.join(basePath, 'dubs_2.jpg')).then((image) => {
            loadedImage = image;
            return jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        }).then((font) => {
            loadedImage.print(font, 680,10, rn).getBuffer(jimp.MIME_PNG, (err, buffer) => {
                channel.send(`${dubs} check em`, { files: [buffer] });
            })
        })
        let docSnapshot = await getDoc(docRef);
        if(docSnapshot.exists()){
            let data = docSnapshot.data();
            if(dubs in data){
                data[dubs] = data[dubs] + 1;
            }else{
                data[dubs] = 1;
            }
            setDoc(docRef, data);
        }else{
            setDoc(docRef, {[dubs]: 1, name: user.username})
        }
    }else{
        channel.send( rn );
    }
}

export const checkRepeatingDigits = (n: number): string => {

    let consecutiveDigits = 0;
    let previous = n%10;
    n = Math.floor(n/10);
    let current = 0;


    while(n > 0){
        current = n % 10;
        if(current == previous) consecutiveDigits += 1;
        else break;
        previous = current;
        n = Math.floor(n/10);
    }
    consecutiveDigits =  consecutiveDigits > 0 ? consecutiveDigits+1 : 0;
    switch(consecutiveDigits){
        case 2:
            return "dubs";
            break;
        case 3:
            return "trips";
            break;
        case 4:
            return "quads";
            break;
        case 5:
            return "quints";
            break;
        default:
            return ""
    }
}

export const dubsScoreBoard = async(channel: Discord.TextChannel, firestore: Firestore) => {
  let collectionRef: CollectionReference<DocumentData> = collection(firestore, `scoreBoards/dubs/${channel.guild}`);
  let collectionSnapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
  let users = collectionSnapshot.docs.sort((a, b) => (a.data()['score'] < b.data()['score']) ? 1 : -1).map(user => {
    return { name: user.data()['name'], value: JSON.stringify(user.data()) }
  });
  let embed = new Discord.MessageEmbed().setColor(0x4286f4).addFields(users);
  channel.send(embed);
}

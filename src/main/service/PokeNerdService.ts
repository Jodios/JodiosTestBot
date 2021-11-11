import Discord from "discord.js";
import axios from "axios";
import { FirebaseStorage, StorageReference, uploadBytes, ref, UploadResult, getDownloadURL } from "firebase/storage";
import { Firestore,doc,setDoc,DocumentData,DocumentReference,CollectionReference,collection,getDoc } from "firebase/firestore";

const url = "https://pokeapi.co/api/v2/pokemon/";
let time = new Date().getTime();
let actualName = "";
let guessed = false;
const referenceName = "pokemonCache";
const imageDownloadUrl = "https://firebasestorage.googleapis.com/v0/b/jodiostestbot.appspot.com/o/pokemonCache%2F546.png?alt=media&token=267f51b2-8901-488b-8564-785205990e71";
const insults: string[] = [
  "You fucking nerd.",
  "What a nerd",
  "Wow! You actually guessed it correctly, you incredibly sad, weird nerd. ",
  "How did you get that? Do you live with your parents? Are you really just a big enough " +
    "loser that you actually know the names of these pokemon by heart? What is wrong with you?",
];

/**
 * This method is called any time a message is sent.
 * n is a random number from 0 - 1000
 * if the 500 < n < 550 then a pokemon will spawn.
 * P(PokeSpawn) = (48/1000)*100 ~= 4.8%
 * about 1 pokemon per 20 messages.
 */
export async function PokeNerdService( n: number,channel: Discord.TextChannel,firestore: Firestore, storage: FirebaseStorage) {
  let pokemonCacheRef: CollectionReference<DocumentData> = collection(firestore, `${referenceName}`);

  if (500 < n && n < 550) {
    let randomPokemonNumber = Math.floor(Math.random() * 806 + 1);
    let docRef: DocumentReference<DocumentData> = doc(pokemonCacheRef,`${randomPokemonNumber}`);
    let docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      time = new Date().getTime();
      actualName = docSnapshot.data()['name'];
      let image = docSnapshot.data()['imageUrl'];
      channel.send("Who's that pokemon?", { files: [image] });
      console.log(actualName);
      guessed = false;
      return;
    }
    let pokeURL = `${url}${randomPokemonNumber}`;
    axios
      .get(pokeURL)
      .then((res) => {
        guessed = false;
        time = new Date().getTime();
        actualName = res.data.forms[0].name;
        let image = res.data.sprites.front_default;
        saveImageToFirebase(image, `${randomPokemonNumber}`, actualName, storage, channel, docRef, res.data); 
        console.log(actualName);
      })
      .catch((err) => onFailed(err, pokeURL));
  }
}

const saveImageToFirebase = (imageUrl: string, pokemonNumber: string, actualName: string, storage: FirebaseStorage,channel: Discord.TextChannel,docRef: DocumentReference<DocumentData>, fulldata: any) => {
  let reference: StorageReference = ref(storage, `/${referenceName}/${pokemonNumber}.png`);
  axios.get(imageUrl, {responseType: 'arraybuffer'}).then(res => {
    let buffer = Buffer.from(res.data, "utf-8");
    let attachement = new Discord.MessageAttachment(buffer, `${pokemonNumber}.png`);
    channel.send("Who's that pokemon?", attachement);
    uploadBytes(reference, buffer).then(async(value: UploadResult) => {
      let data = {
        name: actualName, imageUrl: await getDownloadURL(reference), fulldata
      };
      setDoc( docRef, data );
    }).catch(err => onFailed(err, imageUrl));
  }).catch(err => onFailed(err, imageUrl));
}

/**
 * This method is called any time a message is sent.
 * It first checks if the time difference from when the pokemon
 * spawned and the time of the guess is less than 1
 * and then checks if the guess is correct and if the correct
 * answer has already been guessed with the guessed variable
 */
export function guessName(
  guess: string,
  channel: Discord.TextChannel,
  user: string
) {
  let sec: number = (new Date().getTime() - time) / 1000;
  let min: number = sec / 60;
  if (min < 1 && actualName.toLowerCase() == guess.toLowerCase() && !guessed) {
    let rn = Math.ceil(Math.random() * insults.length - 1);
    channel.send(`<@${user}> ${insults[rn]}`);
    guessed = true;
  }
}

function onFailed(err: Error, url: string) {
  console.log(`error calling ${url}:\n${err}`);
}

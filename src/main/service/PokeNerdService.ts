import Discord from "discord.js";
import axios from "axios";
import { FirebaseStorage, StorageReference, uploadBytes, ref, UploadResult, getDownloadURL } from "firebase/storage";
import { Firestore, doc, setDoc, DocumentData, DocumentReference, CollectionReference, collection, getDoc, getDocs, QuerySnapshot } from "firebase/firestore";

const url = "https://pokeapi.co/api/v2/pokemon/";
let time = new Date().getTime();
let actualName = "";
let guessed = false;
const cacheReferenceName = "pokemonCache";
const scoreboardReferenceName = "pokemonScoreBoard";
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
export async function PokeNerdService(n: number, channel: Discord.TextChannel, firestore: Firestore, storage: FirebaseStorage) {

  if (500 < n && n < 550) {
    let randomPokemonNumber = Math.floor(Math.random() * 806 + 1);
    let docRef: DocumentReference<DocumentData> = doc(firestore, `${cacheReferenceName}/${randomPokemonNumber}`);
    let docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      time = new Date().getTime();
      actualName = docSnapshot.data()['name'];
      let image = docSnapshot.data()['imageUrl'];
      channel.send("Who's that pokemon?", { files: [image] });
      console.log(`${actualName} - retrieved from cache`);
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
        console.log(`${actualName} - retrieved from pokemon api`);
      })
      .catch((err) => onFailed(err, pokeURL));
  }
}

const saveImageToFirebase = (imageUrl: string, pokemonNumber: string, actualName: string, storage: FirebaseStorage, channel: Discord.TextChannel, docRef: DocumentReference<DocumentData>, fulldata: any) => {
  let reference: StorageReference = ref(storage, `/${cacheReferenceName}/${pokemonNumber}.png`);
  axios.get(imageUrl, { responseType: 'arraybuffer' }).then(res => {
    let buffer = Buffer.from(res.data, "utf-8");
    let attachement = new Discord.MessageAttachment(buffer, `${pokemonNumber}.png`);
    channel.send("Who's that pokemon?", attachement);
    uploadBytes(reference, buffer).then(async (value: UploadResult) => {
      let data = {
        name: actualName, imageUrl: await getDownloadURL(reference), fulldata
      };


      setDoc(docRef, {
        base_experience: fulldata.base_experience,
        height: fulldata.height,
        id: fulldata.id,
        is_default: fulldata.is_default,
        location_area_encounter: fulldata.location_area_encounters,
        name: fulldata.name,
        order: fulldata.order,
        weight: fulldata.weight,
        imageUrl: await getDownloadURL(reference)
      })
      // @ts-ignore   
      fulldata.moves.forEach(move => {
        let moveRef = doc(docRef, `moves/${move.move.name}`);
        setDoc(moveRef, move);
      })
      // @ts-ignore   
      fulldata.abilities.forEach(ability => {
        let moveRef = doc(docRef, `abilities/${ability.ability.name}`);
        setDoc(moveRef, ability);
      })
      // @ts-ignore   
      fulldata.forms.forEach(form => {
        let moveRef = doc(docRef, `forms/${form.name}`);
        setDoc(moveRef, form);
      })
      let gameIndexRef = doc(docRef, `game_indices/all_indices`);
      setDoc(gameIndexRef, { game_indices: fulldata.game_indices });
      // @ts-ignore   
      fulldata.held_items.forEach(heldItem => {
        // @ts-ignore
        let heldItemRef = doc(docRef, `held_items/${heldItem.item.name}`);
        setDoc(heldItemRef, heldItem);
      })
      let speciesRef = doc(docRef, `species/all_species`);
      setDoc(speciesRef, fulldata.species);
      let spritesRef = doc(docRef, `sprites/all_prites`);
      setDoc(spritesRef, fulldata.sprites);
      // @ts-ignore   
      fulldata.stats.forEach(stat => {
        let statsRef = doc(docRef, `stats/${stat.stat.name}`);
        setDoc(statsRef, stat);
      })
      // @ts-ignore   
      fulldata.types.forEach(type => {
        let typesRef = doc(docRef, `types/${type.type.name}`);
        setDoc(typesRef, type);
      })

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
export async function guessName(guess: string, channel: Discord.TextChannel, user: Discord.User, firestore: Firestore) {

  let sec: number = (new Date().getTime() - time) / 1000;
  let min: number = sec / 60;
  let docRef: DocumentReference<DocumentData> = doc(firestore, `${scoreboardReferenceName}/${channel.guild}/users/${user.id}/`);
  let docSnapshot = await getDoc(docRef);
  if (min < 1 && actualName.toLowerCase() == guess.toLowerCase() && !guessed) {
  if (docSnapshot.exists()) {
    setDoc(docRef, {
      name: docSnapshot.data()['name'],
      score: docSnapshot.data()['score']+1
    })
  } else {
    setDoc(docRef, {
      name: user.username,
      score: 1
    })
  }
    let rn = Math.ceil(Math.random() * insults.length - 1);
    channel.send(`<@${user.id}> ${insults[rn]}`);
    guessed = true;
  }

}

export const scoreBoard = async(channel: Discord.TextChannel, firestore: Firestore) => {
  let collectionRef: CollectionReference<DocumentData> = collection(firestore, `${scoreboardReferenceName}/${channel.guild}/users`);
  let collectionSnapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
  let users = collectionSnapshot.docs.sort((a, b) => (a.data()['score'] < b.data()['score']) ? 1 : -1).map(user => {
    return { name: user.data()['name'], value: user.data()['score'] }
  });
  let embed = new Discord.MessageEmbed().setColor(0x4286f4).addFields(users);
  channel.send(embed);
}

function onFailed(err: Error, url: string) {
  console.log(`error calling ${url}:\n${err}`);
}

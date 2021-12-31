import Discord from "discord.js";
import axios from "axios";
import { Storage } from "firebase-admin/storage";
import { Firestore, DocumentData, DocumentReference, CollectionReference, QuerySnapshot, FieldValue } from "firebase-admin/firestore";
import { insults } from "../resources/config.json";

const url = "https://pokeapi.co/api/v2/pokemon/";
let time = new Date().getTime();
let actualName = "";
let guessed = false;
const cacheReferenceName = "pokemonCache";
const scoreboardReferenceName = "scoreBoards/pokemon";

/**
 * This method is called any time a message is sent.
 * n is a random number from 0 - 1000
 * if the 500 < n < 550 then a pokemon will spawn.
 * P(PokeSpawn) = (48/1000)*100 ~= 4.8%
 * about 1 pokemon per 20 messages.
 */
export async function PokeNerdService(n: number, channel: Discord.TextChannel, firestore: Firestore, storage: Storage) {
  if (500 < n && n < 550) {
    let randomPokemonNumber = Math.floor(Math.random() * 806 + 1);
    let docRef: DocumentReference<DocumentData> = firestore.doc(`${cacheReferenceName}/${randomPokemonNumber}`);
    let docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      time = new Date().getTime();
      actualName = docSnapshot.data()!['name'];
      let image = docSnapshot.data()!['imageUrl'];
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

const saveImageToFirebase = (imageUrl: string, pokemonNumber: string, actualName: string, storage: Storage, channel: Discord.TextChannel, docRef: DocumentReference<DocumentData>, fulldata: any) => {
  let reference = storage.bucket();
  axios.get(imageUrl, { responseType: 'arraybuffer' }).then(async (res) => {
    let buffer = Buffer.from(res.data, "utf-8");
    let attachement = new Discord.MessageAttachment(buffer, `${pokemonNumber}.png`);
    channel.send("Who's that pokemon?", attachement);
    let file = reference.file(`/${cacheReferenceName}/${pokemonNumber}.png`)
    await file.save(buffer)
    await file.makePublic()

    docRef.set({
      base_experience: fulldata.base_experience,
      height: fulldata.height,
      id: fulldata.id,
      is_default: fulldata.is_default,
      location_area_encounter: fulldata.location_area_encounters,
      name: fulldata.name,
      order: fulldata.order,
      weight: fulldata.weight,
      imageUrl: file.metadata['mediaLink']
    })
    // @ts-ignore   
    fulldata.moves.forEach(move => {
      let moveRef = docRef.firestore.doc(`${docRef.path}/moves/${move.move.name}`)
      moveRef.set(move);
    })
    // @ts-ignore   
    fulldata.abilities.forEach(ability => {
      let moveRef = docRef.firestore.doc(`${docRef.path}/abilities/${ability.ability.name}`)
      moveRef.set(ability);
    })
    // @ts-ignore   
    fulldata.forms.forEach(form => {
      let moveRef = docRef.firestore.doc(`${docRef.path}/forms/${form.name}`)
      moveRef.set(form);
    })
    let gameIndexRef = docRef.firestore.doc(`${docRef.path}/game_indices/all_indices`);
    gameIndexRef.set({ game_indices: fulldata.game_indices });
    // @ts-ignore   
    fulldata.held_items.forEach(heldItem => {
      let heldItemRef = docRef.firestore.doc(`${docRef.path}/held_items/${heldItem.item.name}`)
      heldItemRef.set(heldItem);
    })
    let speciesRef = docRef.firestore.doc(`${docRef.path}/species/all_species`);
    speciesRef.set(fulldata.species);
    let spritesRef = docRef.firestore.doc(`${docRef.path}/sprites/all_prites`);
    spritesRef.set(fulldata.sprites);
    // @ts-ignore   
    fulldata.stats.forEach(stat => {
      let statsRef = docRef.firestore.doc(`${docRef.path}/stats/${stat.stat.name}`);
      statsRef.set(stat);
    })
    // @ts-ignore   
    fulldata.types.forEach(type => {
      let typesRef = docRef.firestore.doc(`${docRef.path}/types/${type.type.name}`);
      typesRef.set(type);
    })

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
  if (min < 1 && actualName.toLowerCase() == guess.toLowerCase() && !guessed) {
    let docRef: DocumentReference<DocumentData> = firestore.doc(`${scoreboardReferenceName}/${channel.guild}/${user.id}/`);
    let docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      docRef.set({
        name: docSnapshot.data()!['name'],
        score: docSnapshot.data()!['score'] + 1
      })
    } else {
      docRef.set({
        name: user.username,
        score: 1
      })
    }
    let rn = Math.ceil(Math.random() * insults.length - 1);
    channel.send(`<@${user.id}> ${insults[rn]}`);
    guessed = true;
  }

}

export const scoreBoard = async (channel: Discord.TextChannel, firestore: Firestore) => {
  let collectionRef: CollectionReference<DocumentData> = firestore.collection(`${scoreboardReferenceName}/${channel.guild}`);
  let collectionSnapshot: QuerySnapshot<DocumentData> = await collectionRef.get();
  let users = collectionSnapshot.docs.sort((a, b) => (a.data()['score'] < b.data()['score']) ? 1 : -1).map(user => {
    return { name: user.data()['name'], value: user.data()['score'] }
  });
  let embed = new Discord.MessageEmbed().setColor(0x4286f4).addFields(users);
  channel.send(embed);
}

function onFailed(err: Error, url: string) {
  console.log(`error calling ${url}:\n${err}`);
}

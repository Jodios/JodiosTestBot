import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
import { onMessage } from "./service/OnMessageService";
import figlet from "figlet";
import firebaseConfig from "./firebase.json";
import {initializeApp, FirebaseApp} from "firebase/app";

let authKey = process.env.discordToken;
console.log(`authKey = ${process.env.discordToken}`)
console.log(`plotlyToken = ${process.env.plotlyToken}`);

let firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Discord Bot
let client = new Discord.Client();

client.on('ready', () => {
    // onVoiceChange(client);
    onMessage(client, firebaseApp);    
    figlet("JodiosTestBot", (err, data) => {

        console.log(data);
        console.log("connected");
        console.log('Logged in as: ');
        console.log(client.user?.tag + ' - (' + client.user?.id + ')');
        
    })
});

client.login(authKey);
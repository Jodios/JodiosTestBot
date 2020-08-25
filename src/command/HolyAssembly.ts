import mongoose, { Model } from "mongoose";
import Discord from "discord.js";

const options: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    dbName: "Memory"
};
const HolySchema: mongoose.Schema = new mongoose.Schema({
    registers: [
        {
            register: { type: String, required: true },
            value: { type: Number, required: true }
        }
    ],
    memory: []
});

let connected: boolean = false;

export async function holyAssembly(instruction: string, channel: Discord.TextChannel, user: Discord.GuildMember) {
    if (!connected) return;
    switch (instruction) {
        case "registers":
            getRegisters(channel, user);
            break;
        default:
            testing(user);
            break;
    }
}

export function getRegisters(channel: Discord.TextChannel, user: Discord.GuildMember) {
    if (!connected) return;
    let test = mongoose.model(`${user.guild.name}_${user.displayName}`, HolySchema);
    test.find().sort('-date').limit(1).exec((err, posts) => {
        if (err) {
            onError;
            return;
        }
        //@ts-ignore
        let embedMessage: Discord.MessageEmbed = createEmbed(posts[0].registers, posts[0].memory);
        channel.send(embedMessage).catch(onError);
    })
}

export function connect() {
    mongoose.connect(process.env.mongooseUrl!, options, (err) => {
        if (err) {
            connected = false;
            onError(err);
        } else {
            connected = true;
            console.log("Connected to " + process.env.mongooseUrl!);
        }
    });
}

function testing(user: Discord.GuildMember) {
    let test = mongoose.model(`${user.guild.name}_${user.displayName}`, HolySchema);
    let entry = null;
    test.count({}, (err, count) => {
        if (err) {
            onError(err);
            return;
        }
        if (count == 0) {
            entry = new test({
                registers: [
                    { register: "R0", value: 0x00 },
                    { register: "R1", value: 0x00 },
                    { register: "R2", value: 0x00 },
                    { register: "R3", value: 0x00 },
                    { register: "IR", value: 0x00 },
                    { register: "PC", value: 0x00 },
                    { register: "MAR", value: 0x00 },
                    { register: "MBR", value: 0x00 }
                ], memory: Array(16).fill(Array(16).fill("F"))
            }).save((err: Error) => {
                if (err) onError(err);
                console.log(`Made new entry for ${user.id}`);
            })
        } else {
            console.log(`${user.id} already has a table`);
        }
    })
}

function createEmbed(messages: { "_id": string, "register": string, "value": number }[], memory: string[][]): Discord.MessageEmbed {
    let messageEmbed: Discord.MessageEmbed = new Discord.MessageEmbed();
    messageEmbed.setTitle("Registers");
    messageEmbed.addFields(
        messages.map(x => {
            return {
                name: x.register,
                value: `0x${(x.value.toString(16).padStart(4, "0"))}`
            }
        })
    );
    let string = "";
    let out = "";
    for (let i = 0; i < memory.length; i++) {
        for (let j = 0; j < memory.length; j += 2) {
            for (let k = j; k < j + 2; k++) {
                string += (memory[i][k])
            }
            out += string + " "
            string = ""
        }
        out += "\n"
    }
    messageEmbed.addField("Memory", out);
    return messageEmbed;
}

function onError(err: Error) {
    console.log(err.message);
}
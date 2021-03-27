import Discord from "discord.js";
import fs from "fs";
import path from "path";


const basePath = path.join(__dirname, "../resources");
const min = 10000000
const max = 99999999

export async function dubsChecker(channel: Discord.TextChannel) {
    fs.readFile( path.join(basePath, 'dubs_1.jpg'), (err, data) => {
        let rn = Math.floor(Math.random() * (max - min+1)+min);
        let dubs = checkRepeatingDigits(rn);
        if(err){
            console.log(err.message);
            return;
        }
        if(dubs != ""){
            channel.send(`${dubs} check em \n                                                                                               ${rn}`, { files: [data] });
        }else{
            channel.send( rn );
        }
    })
}

const checkRepeatingDigits = (n: number): string => {

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
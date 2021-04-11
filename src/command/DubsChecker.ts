import Discord from "discord.js";
import path from "path";
import jimp from "jimp";

const basePath = path.join(__dirname, "../resources");
const min = 10000000
const max = 99999999

export async function dubsChecker(channel: Discord.TextChannel) {
    var loadedImage: jimp;
    let rn = Math.floor(Math.random() * (max - min+1)+min);
    let dubs = checkRepeatingDigits(rn);

    if(dubs != ""){
        jimp.read(path.join(basePath, 'dubs_2.jpg')).then((image) => {
            loadedImage = image;
            return jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        }).then((font) => {
            loadedImage.print(font, 680,10, rn).getBuffer(jimp.MIME_PNG, (err, buffer) => {
                channel.send(`${dubs} check em`, { files: [buffer] });
            })
        })
    }else{
        channel.send( rn );
    }
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
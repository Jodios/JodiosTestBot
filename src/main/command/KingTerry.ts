// https://insult.mattbas.org

import Discord from "discord.js";
import quotes from "../ForKingTerry/KingTerryQuotes";

export function quoteKingTerry(channel: Discord.TextChannel){
    
    let rn = Math.floor(Math.random() * quotes.length)
    let randomQuote = quotes[rn];
    channel.send(randomQuote);

}
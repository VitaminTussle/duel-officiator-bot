import { Client, Intents } from "discord.js";
import * as fs from "fs";

const token = fs.readFileSync("token.txt").toString();

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
]});

client.login(token);

client.on("ready", () => {
    console.log("going brrr");
});

client.on('message', m => {
    if(!m.author.bot){
        if(m.author.username.toLowerCase().includes("d")){
            m.reply("YOU! YOU CARRY THE WILL OF D!!!!");
        }
        if(m.author.username.toLowerCase() == "malgin"){
            m.reply("mal what");
        }
        if(m.author.username.toLowerCase() == "dizee"){
            m.reply("jack. jack please. jack. oh god. he has airpods in. he can't hear us. oh no. oh god.");
        }
        m.pin();
    }
});
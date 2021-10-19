import { Client, Intents } from "discord.js";
import * as fs from "fs";

const token = fs.readFileSync("token.txt").toString();
var p1Id = "";
var p2Id = "";
var stage = "";
var activeTime = new Date();
var p1Bullets = [false, false, false, false, false, false];
var p2Bullets = [false, false, false, false, false, false];
var p1num = 0;
var p2num = 0;
var p1Shots = [false];
var p2Shots = [false];

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
]});

client.login(token);

client.on("ready", () => {
    console.log("going brrr");
});

client.on("messageDelete", m => {
    m.channel.send("you're not sneaky 🙄");
});

client.on("messageCreate", m => {
    //start duel
    if(m.author.bot){
        return;
    }
    else if(m.content === "!duel"){
        m.reply("sorry bud, that ain't how this works. type `!duel [user ping]` to start, or `!duel help` for the rules.")
    }
    else if(m.content.startsWith("!duel")){
        if(m.content.substring(6) === "<@!" + m.author.id + ">"){
            m.reply("no duelin' yourself. no honor in that.");
        } else if((stage === "" || p1Id === "" || new Date().getTime() > activeTime.getTime() + 60000) && hasUserIdArg(m.content)
            /*&& m.content.substring(6) != "<@!" + m.author.id + ">" && m.content.substring(6) != "<@!887475212050919496>"*/){
            activeTime = new Date();
            p1Id = m.author.id;
            p2Id = m.content.substring(9, m.content.length - 1);
            m.reply("alright pardner, so you've thrown down the gauntlet, eh?");
            m.channel.send("our players are <@!" + p1Id + "> and <@!" + p2Id + ">.");
            m.channel.send("<@!" + p1Id + ">, how many bullets ya usin'? (1-6)");
            stage = "p1b";
        } else if(m.content.substring(6) === "help"){
            m.channel.send("here are the rules for the game: " +
                "\n```" + 
                "\n1. this is the wild wild west. we use six shootin' revolvers 'round these parts. you get a max of six shots." +
                "\n" +
                "\n2. we may use revolvers, but of course we have the latest bullet tech. the more hits in a row you get, the more damage you do to your enemy. combo tech, baby." +
                "\n" +
                "\n3. you don't have to load six bullets in your gun. in fact, the fewer bullets you load, the more damage each one does - if there was a bullet in that chamber." +
                "\n```");
        } else if(!hasUserIdArg(m.content)){
            m.reply("can't find that user, sorry bucko");
        } else if(m.content.substring(6) == "<@!887475212050919496>"){
            m.reply("you'd never survive.");
        } else {
            m.channel.send("I respect the antsiness, but keep it in your pants. <@!" + p1Id + "> and <@!" + p2Id + "> are playin' right now.");
        }
    } else if(stage === "p1b" && isNumber(m.content) && m.author.id === p1Id){
        activeTime = new Date();
        var b = parseInt(m.content);
        p1num = b;
        while(b > 0){
            var slot = Math.floor(Math.random() * 6);
            if(!p1Bullets[slot]){
                p1Bullets[slot] = true;
                b--;
            }
        }
        m.channel.send("sounds good, you got yer " + parseInt(m.content) + " bullets. what about you, <@!" + p2Id + ">?");
        stage = "p2b";
    } else if(stage === "p2b" && isNumber(m.content) && m.author.id === p2Id){
        activeTime = new Date();
        var b = parseInt(m.content);
        p2num = b;
        while(b > 0){
            var slot = Math.floor(Math.random() * 6);
            if(!p2Bullets[slot]){
                p2Bullets[slot] = true;
                b--;
            }
        }
        m.channel.send("aight, you got yer " + parseInt(m.content) + " bullets.");
        m.channel.send("now, <@!" + p1Id + ">, which chambers do you want to fire on? (send up to the number of bullets you chose in digits 1-6)");
        stage = "p1o";
    } else if((stage === "p1b" || stage === "p2b") && (m.author.id === p1Id || m.author.id === p2Id)){
        m.channel.send("that's not a number, try again fool.");
    } else if((stage === "p1o") && isChambers(m.content, m.author.id) && m.author.id === p1Id){
        activeTime = new Date();
        p1Shots = [false];
        for(let i = 0; i < m.content.length; i++)
            p1Shots.push(p1Bullets[parseInt(m.content.substring(i,i+1))]);
        m.channel.send("sounds good to me I guess. how about you, <@!" + p2Id + ">?");
        stage = "p2o";
    } else if((stage === "p2o") && isChambers(m.content, m.author.id) && m.author.id === p2Id){
        activeTime = new Date();
        p2Shots = [false];
        for(let i = 0; i < m.content.length; i++)
            p2Shots.push(p2Bullets[parseInt(m.content.substring(i,i+1))]);
        m.channel.send("alrighty. let's get this duel goin'. 10 paces... good. now someone shout \"fire\" to shoot!");
        stage = "fire";
    } else if((stage === "p1o" || stage === "p2o") && (m.author.id === p1Id || m.author.id === p2Id)){
        m.channel.send("you're really joking around at a time like this? you're in a duel, you idiot.");
    } else if(stage === "fire" && m.content.toLowerCase().indexOf("fire") != -1){
        activeTime = new Date();
        var bangs = "";
        var pows = "";
        for(let i = 1; i < p1Shots.length; i++){
            bangs += p1Shots[i] ? "***BANG!***\n" : "*whiff*\n";
        }
        for(let i = 1; i < p2Shots.length; i++){
            pows += p2Shots[i] ? "***POW!***\n" : "*whiff*\n";
        }
        m.channel.send(bangs + pows);

        var p1damage = 0.0;
        var p2damage = 0.0;
        var p1start = 0;
        var p2start = 0;

        for(let i = 0; i < p1Bullets.length; i++){
            if(p1Bullets[i])
                p1start++;
            if(p2Bullets[i])
                p2start++;
        }

        switch(p1start){
            case 1:
                p1damage += 10.0;
                break;
            case 2:
                p1damage += 4.95;
                break;
            case 3:
                p1damage += 3.25;
                break;
            case 4:
                p1damage += 2.4;
                break;
            case 5:
                p1damage += 2.1;
                break;
            case 6:
                p1damage += 1;
                break;
            default:
                p1damage += 0.1;
                break;
        }
        switch(p2start){
            case 1:
                p2damage += 10.0;
                break;
            case 2:
                p2damage += 4.95;
                break;
            case 3:
                p2damage += 3.25;
                break;
            case 4:
                p2damage += 2.4;
                break;
            case 5:
                p2damage += 2.1;
                break;
            case 6:
                p2damage += 1;
                break;
            default:
                p2damage += 0.1;
                break;
        }

        var hit = false;
        var p1multiplier = 0;
        for(let i = 1; i < p1Shots.length; i++){
            if(p1Shots[i]){
                hit = true;
                p1multiplier += 1;
            }
        }
        if(!hit) p1multiplier = 0;
        p1damage = p1damage * p1multiplier;
        hit = false;
        var p2multiplier = 0;
        for(let i = 1; i < p2Shots.length; i++){
            if(p2Shots[i]){
                hit = true;
                p2multiplier += 1;
            }
        }
        if(!hit) p2multiplier = 0;
        p2damage = p2damage * p2multiplier;

        m.channel.send("score:\n" +
                       "<@!"+p1Id+">: " + p1damage + "\n" +
                       "<@!"+p2Id+">: " + p2damage + "\n" +
                       "...\n" +
                       (p1damage > p2damage ? "<@!"+p1Id+">" : (p1damage < p2damage ? "<@!"+p2Id+">" : "no one")) + " wins!");
        if(p1damage === p2damage)
            m.channel.send("you managed to tie lmao guess that means you both die??");
        else
            m.channel.send((p1damage < p2damage ? "<@!"+p1Id+">" : (p1damage > p2damage ? "<@!"+p2Id+">" : "you bothz")) + " died lmao rip");
        m.channel.send("congrats I guess y'all");
        stage = "";
    }
});

var hasUserIdArg = function(u: string) {
    var hasUser = false;
    for(const [key, value] of client.users.cache){
        if("<@!" + value.id + ">" === u.substring(6)){
            hasUser = true;
            break;
        }
    }
    return hasUser;
}

var isNumber = function(s: string){
    return(s === "1" || s === "2" || s === "3" || s === "4" || s === "5" || s === "6");
}

var isChambers = function(s: string, author: string){
    if(s.length > (author === p1Id ? p1num : p2num) || s.length < 1) return false;
    for(let i = 0; i < s.length; i++){
        if(!isNumber(s.substring(i, i+1))) return false;
    }
    return true;
}
var Discord = require('discord.io');
var logger = require('winston'); //For Logging in.

//Below are files I implemented to require
var auth = require('./auth.json'); //Bot Authentication
var sharkfact = require('./sharkfact.json'); //Custom Shark Facts file
//var rsUserLog = require('./RSUserLog');
var api = require('runescape-api'); //Runescape's API
var table = require('cli-table2'); //API to Create clean CSS tables.

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

// Bot Ready
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//Read current praise to console upon startup:
fp = require('fs');
var goodBotPraise = 0;
fp.readFile("praise.txt", 'utf8', function(err,data){
        if (err){
            return console.log(err);
        }
        console.log("Praise currently at: " + data);
        goodBotPraise = data;
   });


//Variables for roulette function
var channel = [];
var channelcontents = [];
var bullet = 6;
var bul = 0;
var inChannel;

//Variables for uptime function
var start = new Date();
var time = start.getTime();

//Variables for Runescape Stuff:
//Will be turned into Multi-Dimensional Array.
//Reason being is that I am weakest at those and wanted practice.
//Transforming to dictionary better idea.
var rs3charName = [];

//variables for OSRS Stuff:
var osCharName = [];


bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        //Logging Input from User
        var call = new Date();
        var input = call.toLocaleString() + ", " + user + ", " + userID + ", " + channelID + ", " + message + "\n";

        fx = require('fs');
        fx.appendFile("botLog.txt", input, function(err){
            if (err) throw err;
            console.log('Saved input to Log');
        });

        args = args.splice(1);
        //console.log("arg was " + args);
        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: '*Pong!*'
                });
            break;
            case 'whoIsLoser':
                bot.sendMessage({
                    to: channelID,
                    message: '*James is!*' //My Best friend ;)
                });
            break;
            case 'flip':
                var x = Math.floor((Math.random() * 2 + 1));
                if (x == 1){
                    bot.sendMessage({
                        to: channelID, 
                        message: '*Heads! You\'re lucky!!*'
                    });
                }
                else {
                    bot.sendMessage({
                        to: channelID, 
                        message: '*Tails! :,(*'
                    });
                }
            break;
            case 'd20':
                var z = Math.floor((Math.random() * 20 + 1));
                bot.sendMessage({
                    to: channelID,
                    message: '*You rolled ' + z + '*'
                });
            break;
            case 'help':
                fs = require('fs');
                fs.readFile("help.txt", 'utf8', function(err,data){
                    if (err){
                        return console.log(err);
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: '*My current list of commands are:*' + '\n' + data
                    });
                });
            break;
            case 'sharkfact':
                var x = Math.floor(Math.random() * 24);
                var print = sharkfact.simple.fact[x].msg;
                bot.sendMessage({
                    to: channelID,
                    message: ':shark::musical_note:  __*Shark Facts*__ :musical_note::shark:\n\n' + print
                })
            break;
            case 'goodbot':
                goodBotPraise++;
                fp.truncate("praise.txt", 0, function(){
                    fp.writeFile("praise.txt", goodBotPraise, function(err){
                        if (err) {
                            return console.log("Error writing to praise.txt:" + err);
                        }
                    });
                });
                bot.sendMessage({
                    to: channelID,
                    message: "***~~Thank*** ***You!~~*** (づ｡◕‿‿◕｡)づ\n\nMy praise is currently " + goodBotPraise + "."
                })
            break;
            case 'badbot':
                if (goodBotPraise >= 1){
                    goodBotPraise--;
                }
                fp.truncate("praise.txt", 0, function(){
                    fp.writeFile("praise.txt", goodBotPraise, function(err){
                        if (err) {
                            return console.log("Error writing to praise.txt:" + err);
                        }
                    });
                });
                bot.sendMessage({
                    to: channelID,
                    message: "I'm sorry, I'm just trying my best!! o(╥﹏╥)o\n\nMy praise is now " + goodBotPraise + "."
                });
            break;
            case 'roulette':
                inChannel = false;

                //Check if channelID is in channel, if it is pull the information from it:
                for (i=0;i<=channel.length;i++){
                    if (channel[i] == channelID){
                        inChannel = true;
                        bul = channelcontents[i];
                        bulIndex = channel.indexOf(channelID);
                    }
                }
                //Otherwise, push values into arrays and initialize:
                if (inChannel == false){
                    //console.log(channelID + " #1");
                    channel.push(channelID);
                    channelcontents.push(bullet);
                    bul = channelcontents[channelcontents.length - 1];
                    bulIndex = channel.indexOf(channelID);
                }
                //Personally don't think this is used.
                if (bul <= 1){
                    channelcontents.splice(bulIndex,1);
                    channel.splice(bulIndex,1);
                    bot.sendMessage({
                        to: channelID,
                        message: "**BANG!!** " + user + " has died...\nPress F to pay respects."
                    });
                }
                //Else if you landed on 1, the bullet kills you in this case
                else {  
                    var x = Math.floor(Math.random() * bul + 1);
                    if (x == 1){
                        channelcontents.splice(bulIndex,1);
                        channel.splice(bulIndex,1);
                        bot.sendMessage({
                            to: channelID,
                            message: "**BANG!!** " + user + " has died...\nPress F to pay respects."
                        });
                    }
                    //If you avoided the bullet
                    else {
                        channelcontents[bulIndex]--;
                        bul = channelcontents[bulIndex];
                        bot.sendMessage({
                            to: channelID,
                            message: "*Click*... lucky. " + bul + " rounds left in the chamber. Whose next..?"
                        });
                    }
                }
            break;
            case 'hiscore':
                var name;
                var x;
                function aInfo(info) {
                    var skills = info.skills;
                    x = skills;

                    var nt1 = new table({
                        chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
                        style: {
                            head:[],
                            border:[]
                        },
                        colWidths:[15,9,8,15]
                    });
                    var nt2 = new table({
                        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                                 , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                                 , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                                 , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
                        style: {
                            head:[],
                            border:[]
                        },
                        colWidths:[15,9,8,15]
                    });
                    nt1.push(
                            ['Overall', skills.overall.rank.toLocaleString(), skills.overall.level.toLocaleString(), skills.overall.exp.toLocaleString()],
                            ['Attack', skills.attack.rank.toLocaleString(), skills.attack.level.toLocaleString(), skills.attack.exp.toLocaleString()],
                            ['Defence', skills.defence.rank.toLocaleString(), skills.defence.level.toLocaleString(), skills.defence.exp.toLocaleString()],
                            ['Strength', skills.strength.rank.toLocaleString(), skills.strength.level.toLocaleString(), skills.strength.exp.toLocaleString()],
                            ['Hitpoints', skills.hitpoints.rank.toLocaleString(), skills.hitpoints.level.toLocaleString(), skills.hitpoints.exp.toLocaleString()],
                            ['Ranged', skills.ranged.rank.toLocaleString(), skills.ranged.level.toLocaleString(), skills.ranged.exp.toLocaleString()],
                            ['Prayer', skills.prayer.rank.toLocaleString(), skills.prayer.level.toLocaleString(), skills.prayer.exp.toLocaleString()],
                            ['Magic', skills.magic.rank.toLocaleString(), skills.magic.level.toLocaleString(), skills.magic.exp.toLocaleString()],
                            ['Cooking', skills.cooking.rank.toLocaleString(), skills.cooking.level.toLocaleString(), skills.cooking.exp.toLocaleString()],
                            ['Woodcutting', skills.woodcutting.rank.toLocaleString(), skills.woodcutting.level.toLocaleString(), skills.woodcutting.exp.toLocaleString()],
                            ['Fletching', skills.fletching.rank.toLocaleString(), skills.fletching.level.toLocaleString(), skills.fletching.exp.toLocaleString()],
                            ['Fishing', skills.fishing.rank.toLocaleString(), skills.fishing.level.toLocaleString(), skills.fishing.exp.toLocaleString()],
                            ['Firemaking', skills.firemaking.rank.toLocaleString(), skills.firemaking.level.toLocaleString(), skills.firemaking.exp.toLocaleString()],
                            ['Crafting', skills.crafting.rank.toLocaleString(), skills.crafting.level.toLocaleString(), skills.crafting.exp.toLocaleString()],
                            ['Smithing', skills.smithing.rank.toLocaleString(), skills.smithing.level.toLocaleString(), skills.smithing.exp.toLocaleString()],
                            ['Mining', skills.mining.rank.toLocaleString(), skills.mining.level.toLocaleString(), skills.mining.exp.toLocaleString()],
                            ['Herblore', skills.herblore.rank.toLocaleString(), skills.herblore.level.toLocaleString(), skills.herblore.exp.toLocaleString()],
                            ['Agility', skills.agility.rank.toLocaleString(), skills.agility.level.toLocaleString(), skills.agility.exp.toLocaleString()],
                            ['Thieving', skills.thieving.rank.toLocaleString(), skills.thieving.level.toLocaleString(), skills.thieving.exp.toLocaleString()],
                            ['Slayer', skills.slayer.rank.toLocaleString(), skills.slayer.level.toLocaleString(), skills.slayer.exp.toLocaleString()],
                            ['Farming', skills.farming.rank.toLocaleString(), skills.farming.level.toLocaleString(), skills.farming.exp.toLocaleString()],
                            ['Runecrafting', skills.runecrafting.rank.toLocaleString(), skills.runecrafting.level.toLocaleString(), skills.runecrafting.exp.toLocaleString()],
                            ['Hunter', skills.hunter.rank.toLocaleString(), skills.hunter.level.toLocaleString(), skills.hunter.exp.toLocaleString()],
                            ['Construction', skills.construction.rank.toLocaleString(), skills.construction.level.toLocaleString(), skills.construction.exp.toLocaleString()],
                            ['Summoning', skills.summoning.rank.toLocaleString(), skills.summoning.level.toLocaleString(), skills.summoning.exp.toLocaleString()],
                            ['Dungeoneering', skills.dungeoneering.rank.toLocaleString(), skills.dungeoneering.level.toLocaleString(), skills.dungeoneering.exp.toLocaleString()],
                            ['Divination', skills.divination.rank.toLocaleString(), skills.divination.level.toLocaleString(), skills.divination.exp.toLocaleString()],
                            ['Invention', skills.invention.rank.toLocaleString(), skills.invention.level.toLocaleString(), skills.invention.exp.toLocaleString()]
                            );

                    nt2.push([{colSpan:4 ,hAlign:'center',content:'For User: ' + name}],
                            ['SKILLS', 'RANK', 'LEVEL', 'EXPERIENCE']);

                    bot.sendMessage({
                        to: channelID,
                        message: '```'+ nt2 + "\n" +  nt1+'```',
                        // embed: {
                        //     color: 3540908,
                        //     footer: {
                        //         text: ''
                        //     },
                        //     thumbnail:     //Uncomment this if you want a footer, title, or embedded link.
                        //     {
                        //         url: ''
                        //     },
                        //     title: '',
                        //     url: ''
                        
                    });
                }
                var namers3 = null; //May need to change if there is user named 'null'
                for (i=0;i<rs3charName.length;i++){
                    if (rs3charName[i][0] == userID){
                        namers3 = rs3charName[i][1];
                    }
                }
                //THERE IS NO STORED NAME AND ARGUMENT NAME
                if (args.length == 0 & namers3 == null){
                    api.rs.hiscores.player(user).then(aInfo).catch(console.error);
                    name = user.toUpperCase();
                }
                //THERE IS A STORED NAME
                else if (args.length == 0){
                    api.rs.hiscores.player(namers3).then(aInfo).catch(console.error);
                    name = namers3.toUpperCase();
                }
                //THERE IS AN ARGUMENT
                else {
                    api.rs.hiscores.player(args[0]).then(aInfo).catch(console.error);
                    name = args[0].toUpperCase();
                }
            break;
            case 'hiscore-os':
            var name;
            function getInfo(info){
                var skills = info.skills;

                var top = new table({
                    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                            , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                            , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                            , 'right': '║' , 'right-mid': '╢' , 'middle': '│' },
                    style: {
                        head:[],
                        border:[]
                    },
                    colWidths:[15,9,8,15]
                });
                var bottom = new table({
                    chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
                    style: {
                        head:[],
                        border:[]
                    },
                    colWidths:[15,9,8,15]
                });

                //HEADER
                top.push([{colSpan:4 ,hAlign:'center',content:'For User: ' + name}],
                         ['SKILLS', 'RANK', 'LEVEL', 'EXPERIENCE']);

                //OSRS skills
                bottom.push(
                            ['Overall',      skills.overall.rank.toLocaleString(),      skills.overall.level.toLocaleString(),      skills.overall.exp.toLocaleString()],
                            ['Attack',       skills.attack.rank.toLocaleString(),       skills.attack.level.toLocaleString(),       skills.attack.exp.toLocaleString()],
                            ['Defence',      skills.defence.rank.toLocaleString(),      skills.defence.level.toLocaleString(),      skills.defence.exp.toLocaleString()],
                            ['Strength',     skills.strength.rank.toLocaleString(),     skills.strength.level.toLocaleString(),     skills.strength.exp.toLocaleString()],
                            ['Hitpoints',    skills.hitpoints.rank.toLocaleString(),    skills.hitpoints.level.toLocaleString(),    skills.hitpoints.exp.toLocaleString()],
                            ['Ranged',       skills.ranged.rank.toLocaleString(),       skills.ranged.level.toLocaleString(),       skills.ranged.exp.toLocaleString()],
                            ['Prayer',       skills.prayer.rank.toLocaleString(),       skills.prayer.level.toLocaleString(),       skills.prayer.exp.toLocaleString()],
                            ['Magic',        skills.magic.rank.toLocaleString(),        skills.magic.level.toLocaleString(),        skills.magic.exp.toLocaleString()],
                            ['Cooking',      skills.cooking.rank.toLocaleString(),      skills.cooking.level.toLocaleString(),      skills.cooking.exp.toLocaleString()],
                            ['Woodcutting',  skills.woodcutting.rank.toLocaleString(),  skills.woodcutting.level.toLocaleString(),  skills.woodcutting.exp.toLocaleString()],
                            ['Fletching',    skills.fletching.rank.toLocaleString(),    skills.fletching.level.toLocaleString(),    skills.fletching.exp.toLocaleString()],
                            ['Fishing',      skills.fishing.rank.toLocaleString(),      skills.fishing.level.toLocaleString(),      skills.fishing.exp.toLocaleString()],
                            ['Firemaking',   skills.firemaking.rank.toLocaleString(),   skills.firemaking.level.toLocaleString(),   skills.firemaking.exp.toLocaleString()],
                            ['Crafting',     skills.crafting.rank.toLocaleString(),     skills.crafting.level.toLocaleString(),     skills.crafting.exp.toLocaleString()],
                            ['Smithing',     skills.smithing.rank.toLocaleString(),     skills.smithing.level.toLocaleString(),     skills.smithing.exp.toLocaleString()],
                            ['Mining',       skills.mining.rank.toLocaleString(),       skills.mining.level.toLocaleString(),       skills.mining.exp.toLocaleString()],
                            ['Herblore',     skills.herblore.rank.toLocaleString(),     skills.herblore.level.toLocaleString(),     skills.herblore.exp.toLocaleString()],
                            ['Agility',      skills.agility.rank.toLocaleString(),      skills.agility.level.toLocaleString(),      skills.agility.exp.toLocaleString()],
                            ['Thieving',     skills.thieving.rank.toLocaleString(),     skills.thieving.level.toLocaleString(),     skills.thieving.exp.toLocaleString()],
                            ['Slayer',       skills.slayer.rank.toLocaleString(),       skills.slayer.level.toLocaleString(),       skills.slayer.exp.toLocaleString()],
                            ['Farming',      skills.farming.rank.toLocaleString(),      skills.farming.level.toLocaleString(),      skills.farming.exp.toLocaleString()],
                            ['Runecrafting', skills.runecrafting.rank.toLocaleString(), skills.runecrafting.level.toLocaleString(), skills.runecrafting.exp.toLocaleString()],
                            ['Hunter',       skills.hunter.rank.toLocaleString(),       skills.hunter.level.toLocaleString(),       skills.hunter.exp.toLocaleString()],
                            ['Construction', skills.construction.rank.toLocaleString(), skills.construction.level.toLocaleString(), skills.construction.exp.toLocaleString()]
                            );
                //Display table in chat
                bot.sendMessage({
                    to: channelID,
                    message: '```'+ top + "\n" + bottom +'```',
                    // embed: {
                    //     color: 3540908,
                    //     footer: {
                    //         text: ''
                    //     },
                    //     thumbnail:    //Uncomment this if you want footer, title, or embedded link.
                    //     {
                    //         url: ''
                    //     },
                    //     title: '',
                    //     url: ''
                    // }
                });
                console.log(top.toString() +"\n"+ bottom.toString());
            }
            //FUNCITON TO ATTEMPT TO PULLED STORED OSRS USERNAME
            var nameOS = null; //may need to change- what if there is a username 'null'?
            for (i=0;i<osCharName.length;i++){
                if (osCharName[i][0] == userID){
                    nameOS = osCharName[i][1];
                }
            }
            //THERE IS NO STORED NAME AND NO ARGUMENT NAME:
            if (args.length == 0 & nameOS == null){
                api.osrs.hiscores.player(user).then(getInfo).catch(console.error);
                name = user.toUpperCase();
            }
            //THERE IS AN ARGUMENT NAME:
            else if (args.length != 0){
                api.osrs.hiscores.player(args[0]).then(getInfo).catch(console.error);
                name = args[0].toUpperCase();
            }
            //THERE IS A STORED NAME:
            else {
                api.osrs.hiscores.player(nameOS).then(getInfo).getch(console.error);
                name = nameOS.toUpperCase();
            }
            break;
            case 'uptime':
                var end = new Date();
                var endtime = end.getTime();
                var timeDiff = Math.abs(time - endtime);
                
                bot.sendMessage({
                    to: channelID,
                    message: "```I started running on: " + start.toLocaleString() + " \nand have been running for " + Math.ceil(timeDiff/(1000 * 3600 * 24)) + " days without injuries! (づ｡◕‿‿◕｡)づ```"
                });
            break;
            //THIS CASE WILL BE FULLY IMPLEMENTED WHEN THE BOT IS CONTINUOUSLY RUNNING. OBNOXIOUS OTHERWISE
            case 'set-rs3':
                var x = false;
                for (i=0;i<=rs3charName.length;i++){
                    try{
                        if (rs3charName[i][0] == userID){
                            rs3charName[i][1] = args[0];
                            x = true;
                            console.log("Updated internal rs3 name from userID " + userID + " to name: " + args[0]);
                            return;
                        }
                    } catch(err){ // THIS SITUATION HAPPENS WHEN FIRST ARRAY IS EMPTY (THINK WHEN MACHINE IS FIRST TURNED ON)
                    rs3charName[i] = [];
                    rs3charName[i][0] = userID;
                    rs3charName[i][1] = args[0];
                    console.log("Created new set rs3 name for userID " + userID + " to name: " + args[0]);
                    return;
                    }
                }
                //USER IS NOT IN STORED ARRAY, THEREFORE THEY MUST BE ADDED
                if (x == false){ 
                    rs3charName[rs3charName.length][0] = userID;
                    rs3charName[rs3charName.length][1] = args[0];
                    console.log("Created new set rs3 name for userID " + userID + " to name: " + args[0]);
                }
            break;
            case 'set-osrs':
            var x = false;
            for (i=0;i<=osCharName.length;i++){
                try{
                    if (osCharName[i][0] == userID){
                        osCharName[i][1] = args[0];
                        x = true;
                        console.log("Updated intername osrs name from userID " + userID + " to name: " + args[0]);
                        return;
                    }
                }
                //THIS SITUATION WILL OCCUR WHEN THE ARRAY IS COMPLETELY EMPTY AND MUST MAKE FIRST ENTRY
                catch(err){
                    osCharName[i] = [];
                    osCharName[i][0] = userID;
                    osCharName[i][1] = args[0];
                    console.log("Created new set osrs name for userID " + userID + " to name: " + args[0]);
                    return;
                }
            }
            //USER IS NOT IN STORED ARRAY, THEREFORE THEY MUST BE ADDED
            if (x == false){
                osCharName[osCharName.length][0] = userID;
                osCharName[osCharName.length][1] = args[0];
                console.log("Created new set osrs name for userID " + userID + " to name: " + args[0]);
            }
            break;
            default:
                bot.sendMessage({to: channelID, message: '*That is not a function! Type !help for commands.*'});
            break;
         }

        //Do you want to bot to randomly boop during every message? uncomment below:
        //bot.sendMessage({
        //  to: channelID,
        //  message: '**BeepBoop**'
        //});

     }
    //Below is for adding miscellaneous functions







});

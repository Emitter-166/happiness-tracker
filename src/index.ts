import { ButtonInteraction, Client, EmbedBuilder, IntentsBitField, Interaction, Message, ModalSubmitInteraction} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize';
import { messageCreate_listener } from './events/messageCreate';
import { InteractionCreate_listener } from './events/InteractionCreate';
import { reminder_scanner, send_reminder } from './services/scoreCollectionServices';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'happiness.db',
    logging: false
})


const path_to_models = path.join(__dirname, 'database', 'models');

fs.readdirSync(path_to_models)
    .forEach(modelFile => {
        const model = require(path.join(path_to_models, modelFile));
        model.model(sequelize);
    })




sequelize.sync({alter: true}).then(async sequelize => {
    // for(let i = 0; i<100; i++){
    //     await add_entry('671016674668838952', {
    //         happiness: Math.ceil(Math.random() * 5),
    //         healthiness: Math.ceil(Math.random() * 5),
    //         confidence: Math.ceil(Math.random() * 5),
    //     })
    // }
    client.login(process.env._TOKEN);        
})


const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
    messageCreate_listener(client);
    InteractionCreate_listener(client);
    reminder_scanner(); 

 })

export const errHandler = async (err: any, msg: any) => {
    try{
        const errBed = new EmbedBuilder()
            .setTitle("An error occurred!")
            .setDescription('```' + err.message + "```");
        await msg.reply({
            embeds: [errBed],
            ephemeral: true
        })
    }catch(err){
        console.log("Err on /src/errHandler()");
        console.log(err);
    }
}








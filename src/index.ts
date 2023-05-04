import { Client, IntentsBitField} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize';
import { add_entry, create_entry_graph, get_entries } from './services/entryServices';

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
    client.login(process.env._TOKEN);    
    console.log(await get_entries({userId: 'user2'}, 5, 5));
    // const data = await create_entry_graph(await get_entries({userId: 'user2'}, 5), ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August']);
    // fs.writeFileSync('my-chart.png', data);
    
})


const F = IntentsBitField.Flags;
const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
})










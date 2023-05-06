import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, Interaction } from "discord.js";
import { create_entry_graph, download_data, get_entries } from "./entryServices";
import fs from 'fs';
import { client, sequelize } from "..";

export const happiness_tracker = async (channelId: string) => {
    try{
        if(!client.isReady()) return;
        const channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel;

        const server_data = await get_entries({ }, 30, 4);
        const server_graph = await create_entry_graph(server_data, ['week 1', 'week 2', 'week 3', 'week 4'])
        
        const attachment = new AttachmentBuilder(server_graph, {name: 'stats.png'});
        const text = `**Unlock a deeper understanding of your happiness - click the buttons below to rate and track your happiness over time!** \n \n **Average server happiness:**`;

        const rows = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('happiness-tracker-rate')
                    .setLabel('Rate your happiness')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('happiness-tracker-see')
                    .setLabel('See your happiness')
                    .setStyle(ButtonStyle.Secondary)
            )
        
        await channel.send({
            files: [attachment],
            content: text,
            components: [rows]
        })
    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/happiness_tracker()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const onBoard = async (userId: string) => {

}

export const getRows = (name: string) => {
    const rows = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId(`happiness-tracker-rate-${name}-1`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('1'),
        new ButtonBuilder()
            .setCustomId(`happiness-tracker-rate-${name}-2`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('2'),
        new ButtonBuilder()
            .setCustomId(`happiness-tracker-rate-${name}-3`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('3'),
        new ButtonBuilder()
            .setCustomId(`happiness-tracker-rate-${name}-4`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('4'),
        new ButtonBuilder()
            .setCustomId(`happiness-tracker-rate-${name}-5`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('5')
    )

    return rows;
}

export const happiness_tracker_message = async (interaction: ButtonInteraction) => {
    try{
        const rows = getRows('happiness');
            
        const msg = '**How happy do you feel today on a scale of 5? 😊** \n';

        await interaction.reply({
            content: msg,
            components: [rows],
            ephemeral: true
        })
        
    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/happiness_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const healthiness_tracker_message = async (interaction: ButtonInteraction) => {
    try{
        const rows = getRows('healthiness');

            
        const msg = '**How healhy are you on a scale of 5? 🍎** \n';

        await interaction.update({
            content: msg,
            components: [rows],
        })
        
    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/healthiness_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const confidence_tracker_message = async (interaction: ButtonInteraction) => {
    try{
        const rows = getRows('confidence');
            
        const msg = '**How confident do you feel today on a scale of 5? 😎** \n';

        await interaction.update({
            content: msg,
            components: [rows],
        })
        
    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/happiness_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const tracker_done_message = async (interaction: ButtonInteraction) => {
    try{
        const rows = new ActionRowBuilder<ButtonBuilder>()  
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('happiness-tracker-see')
                    .setLabel('See your happiness')
                    .setStyle(ButtonStyle.Secondary)
            )
            
        const msg = '**Good job on completing the rating for today! We will remind you tomorrow!! 🥳🥳** \n';

        await interaction.update({
            content: msg,
            components: [rows],
        })
        
    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/tracker_done_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const downlod_data_message = async (interaction: ButtonInteraction) => {
    try{
        const userId = interaction.user.id;
        const data = await download_data(userId);
        const attachment = new AttachmentBuilder(data)
            .setName('data.txt');
        
        await interaction.update({
                files: [attachment],
                content: '**Here is your happiness data :eyes**'
        })

    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/tracker_done_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const send_reminder = async (userId: string) => {
    try{
        const dm = await (await client.users.fetch(userId)).createDM();

        const text = `**Reminding you to take the happiness entry today 😁**\n`;
        const rows = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('happiness-tracker-rate')
                .setLabel('Rate your happiness')
                .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('happiness-tracker-see')
                    .setLabel('See your happiness')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('Server happiness')
                    .setStyle(ButtonStyle.Link)
                    .setURL(process.env._TRACKER_CHANNEL as string),
            
                )
            await dm.send({
                content: text,
                components: [rows]
            })

    }catch(err: any){
        console.log("Err on /services/scoreCollectionServices.ts/send_reminder()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const reminder_scanner = () => {
    setInterval(async () => {
        const users_model = sequelize.model('users');

        const all = await users_model.findAll();

        for(let user of all){
            const {lastEntryAt, userId} = user.dataValues;

            if(lastEntryAt+86400000 < Date.now()){
                await send_reminder(userId);
            }
        }
    })
}
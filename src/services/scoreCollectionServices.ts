import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, GuildTextBasedChannel } from "discord.js";
import { create_entry_graph, get_entries } from "./entryServices";
import fs from 'fs';
import { client } from "..";

export const happiness_tracker = async (channelId: string) => {
    try{
        if(!client.isReady()) return;
        const channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel;

        const server_data = await get_entries({}, 30, 4);
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
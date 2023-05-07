import { Client } from "discord.js";
import { happiness_tracker } from "../services/scoreCollectionServices";
import { errHandler } from "..";

export const messageCreate_listener = (client: Client) => {
    client.on('messageCreate', async msg => {
        try{
            if(!msg.content.toLocaleLowerCase().startsWith("!happiness-tracker")) return;
            if(!msg.member?.permissions.has('ModerateMembers')) return;
            await happiness_tracker(msg.channelId);
        }catch(err){
            console.log("Err on /events/messageCreate.ts");
            console.log(err);
            errHandler(err, msg);
        }
    })
}
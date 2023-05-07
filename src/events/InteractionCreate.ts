import { ButtonInteraction, Client, ModalSubmitInteraction } from "discord.js";
import { errHandler } from "..";
import { confidence_tracker_message, downlod_data_message, happiness_tracker_message, healthiness_tracker_message, onBoard, onboard_modal, onboard_modal_handler, tracker_done_message } from "../services/scoreCollectionServices";
import { add_entry } from "../services/entryServices";
import { d7, m1, m3, m6, see_happiness_message } from "../services/trackerSeeServices";

export const InteractionCreate_listener = (client: Client) => {
    client.on('interactionCreate', async interaction => {
        try{
            if(interaction.isButton()) return await buttonHandler(interaction);
            if(interaction.isModalSubmit()) return await modalHandler(interaction);
            
        }catch(err){
            console.log("Err on /events/interactionCreate.ts");
            console.log(err);
            errHandler(err, interaction);
        }
    })
}

const buttonHandler = async (int: ButtonInteraction) => {
    try{
        const customId = int.customId; 
        
        switch(customId){
            case 'happiness-tracker-rate':
                return await happiness_tracker_message(int); //1
            case 'happiness-tracker-download-data':
                return await downlod_data_message(int); 
            case 'happiness-tracker-see':
                return await see_happiness_message(int); 
            case 'happiness-tracker-onboard-button':
                return await onboard_modal(int);
        }

        if(customId.startsWith('happiness-tracker-rate-happiness')){

            const allowed = await onBoard(int.user.id);
            if(!allowed){
                int.update('**Sending you a dm... please make sure its open!**')
                return;
            }
            
            const rating = Number(customId.split('-')[4]);
            await add_entry(int.user.id, {happiness: rating});

            await healthiness_tracker_message(int); //2
        }else if(customId.startsWith('happiness-tracker-rate-healthiness')){
            const rating = Number(customId.split('-')[4]);
            await add_entry(int.user.id, {healthiness: rating});

            await confidence_tracker_message(int); //3
        }else if(customId.startsWith('happiness-tracker-rate-confidence')){
            const rating = Number(customId.split('-')[4]);
            await add_entry(int.user.id, {confidence: rating});

            await tracker_done_message(int); //done
        }

        if(customId.startsWith('happiness-tracker-see-happiness')){
            const id = customId.split('-')[4];
            
            switch(id){
                case "7d": return await d7(int)
                case "1m": return await m1(int)
                case "3m": return await m3(int)
                case "6m": return await m6(int)
            }
        }
        
    }catch(err: any){
        console.log("Err at events/interactionCreate.ts/buttonHandler()");
        console.log(err);
        throw new Error(err.message);
    }
}

const modalHandler = async (int: ModalSubmitInteraction) => {
    try{
       const {customId} = int;
       switch(customId){
            case 'happiness-tracker-onboard-modal': return await onboard_modal_handler(int)
        }
    }catch(err: any){
        console.log("Err at events/interactionCreate.ts/modalHandler()");
        console.log(err);
        throw new Error(err.message);
    }
}
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    GuildTextBasedChannel,
    Interaction,
    Message,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import {
    create_entry_graph,
    download_data,
    get_entries
} from "./entryServices";
import {
    getCode,
    getNames
} from 'country-list';
import {
    client,
    sequelize
} from "..";
let TRACKER_MSG: Message | undefined = undefined;

export const happiness_tracker = async (channelId?: string, msg?: Message) => {
    try {
        if (!client.isReady()) return;
        if(!msg && !channelId) return;
        
        let channel;
        if(channelId)
            channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel;

        const server_data = await get_entries({}, 30, 4);
        
        const server_graph = await create_entry_graph(server_data, getWeeksOfMonth())

        
        const attachment = new AttachmentBuilder(server_graph, {
            name: 'stats.png'
        });
        const text = `**Unlock a deeper understanding of your happiness - click the buttons below to rate and track your happiness over time!** \n \n **Average server happiness:**`;

        const rows = new ActionRowBuilder < ButtonBuilder > ()
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

        if(!msg && channel){
            TRACKER_MSG = await channel.send({
            files: [attachment],
            content: text,
            components: [rows]
        })}else{
            await msg?.edit({
                files: [attachment],
                content: text,
                components: [rows]
            })
        }
        
    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/happiness_tracker()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const update_happiness_tracker_msg = () => {
    setInterval(async () => {
        await happiness_tracker('', TRACKER_MSG)
    }, 10_000)
}
export function getWeeksOfMonth() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentWeek = Math.ceil((now.getDate() + firstDayOfMonth.getDay()) / 7);
    const weeks = ['1st week', '2nd week', '3rd week', '4th week'];
    const result = [];
    for (let i = currentWeek; i < weeks.length; i++) {
        result.push(weeks[i]);
    }
    for (let i = 0; i < currentWeek; i++) {
        result.push(weeks[i]);
    }
    return result;
}
  
  
  
export const onBoard = async (userId: string) => {
    try {
        const users_model = sequelize.model('users');
        const user = await users_model.findOne({
            where: {
                userId: userId
            }
        })

        if (user) {
            await user.update({
                lastEntryAt: Date.now(),
                reminded: false
            })
            return true;
        }

        const text = '**Hey! I would like to know a bit more about you before you we get started!! 💖✨**'
        const rows = new ActionRowBuilder < ButtonBuilder > ()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('happiness-tracker-onboard-button')
                .setLabel('Lets Go!')
                .setStyle(ButtonStyle.Success)
            )

        const dm = await (await client.users.fetch(userId)).createDM();
        await dm.send({
            content: text,
            components: [rows]
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/onBoard_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const onboard_add_entry = async (data: {
    userId: string,
    age: number,
    country: string,
    gender: string
}) => {
    try {

        const {
            userId,
            age,
            gender,
            country
        } = data;

        if (age < 13) throw new Error('You cannot be under 13!');
        if (gender !== 'he' && gender !== 'she' && gender !== 'other') throw new Error('Please enter a valid gender! (he/she/other)');
        if (!isCountryNameCorrect(country)) throw new Error('Please enter a valid country name! e.g. United States')

        const users_model = sequelize.model('users');
        const user = await users_model.findOrCreate({
            where: {
                userId: data.userId
            },
            defaults: {
                ...data
            }
        })

        return user[0].dataValues;

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/onboard_add_entry()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const onboard_modal = async (int: ButtonInteraction) => {
    try {
        const inputRow1 = new ActionRowBuilder < TextInputBuilder > ()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('happiness-tracker-onboard-input-country')
                .setRequired(true)
                .setLabel('Your Country')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g. United States')
                .setMinLength(4)
                .setMaxLength(60)
            );

        const inputRow2 = new ActionRowBuilder < TextInputBuilder > ()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('happiness-tracker-onboard-input-gender')
                .setRequired(true)
                .setLabel('Your Gender')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('he she other')
                .setMinLength(2)
                .setMaxLength(5)
            );

        const inputRow3 = new ActionRowBuilder < TextInputBuilder > ()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('happiness-tracker-onboard-input-age')
                .setRequired(true)
                .setLabel('Your Age')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g. 13')
                .setMinLength(2)
                .setMaxLength(2)
            );

        const modal = new ModalBuilder()
            .setCustomId('happiness-tracker-onboard-modal')
            .setTitle('Hey!!')
            .setComponents(inputRow1, inputRow2, inputRow3);

        await int.showModal(modal);

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/onboard_modal()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const onboard_modal_handler = async (int: ModalSubmitInteraction) => {
    try {
        const country = int.fields.getTextInputValue('happiness-tracker-onboard-input-country');
        const gender = int.fields.getTextInputValue('happiness-tracker-onboard-input-gender');
        const age_str = int.fields.getTextInputValue('happiness-tracker-onboard-input-age');

        const age = Number(age_str);
        if (Number.isNaN(age)) throw new Error('Please enter a valid age!');

        await onboard_add_entry({
            userId: int.user.id,
            age: age,
            gender: gender.toLowerCase().trim(),
            country: country.toLowerCase().trim()
        })

        await int.reply({
            content: '**Thank you for your response! You may continue with the wellbeing tracker!**',
            ephemeral: true
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/onboard_modal_handler()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const getRows = (name: string) => {
    const rows = new ActionRowBuilder < ButtonBuilder > ()
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
    try {
        const rows = getRows('happiness');

        const msg = '**How happy do you feel today on a scale of 5? 😊** \n';

        await interaction.reply({
            content: msg,
            components: [rows],
            ephemeral: true
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/happiness_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const healthiness_tracker_message = async (interaction: ButtonInteraction) => {
    try {
        const rows = getRows('healthiness');


        const msg = '**How healhy are you on a scale of 5? 🍎** \n';

        await interaction.update({
            content: msg,
            components: [rows],
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/healthiness_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const confidence_tracker_message = async (interaction: ButtonInteraction) => {
    try {
        const rows = getRows('confidence');

        const msg = '**How confident do you feel today on a scale of 5? 😎** \n';

        await interaction.update({
            content: msg,
            components: [rows],
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/confidence_tracker_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const tracker_done_message = async (interaction: ButtonInteraction) => {
    try {
        const rows = new ActionRowBuilder < ButtonBuilder > ()
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

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/tracker_done_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const downlod_data_message = async (interaction: ButtonInteraction) => {
    try {
        const userId = interaction.user.id;
        const data = await download_data(userId);
        const attachment = new AttachmentBuilder(data)
            .setName('data.txt');

        await interaction.update({
            files: [attachment],
            content: '**Here is your happiness data 👀**'
        })

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/downlod_data_message()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const send_reminder = async (userId: string) => {
    try {
        const dm = await (await client.users.fetch(userId)).createDM();

        const text = `**Reminding you to take the happiness entry today 😁**\n`;
        const rows = new ActionRowBuilder < ButtonBuilder > ()
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

    } catch (err: any) {
        console.log("Err on /services/scoreCollectionServices.ts/send_reminder()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const reminder_scanner = () => {
    setInterval(async () => {
        const users_model = sequelize.model('users');

        const all = await users_model.findAll();

        for (let user of all) {
            const {
                lastEntryAt,
                userId,
                reminded
            } = user.dataValues;

            if ((lastEntryAt + 86400000 < Date.now()) && (reminded === false)) {
                await send_reminder(userId);
                await user.update({
                    reminded: true
                })
            }
        }
    }, 10_000)
}

export const isCountryNameCorrect = (name: string) => {
    const countryNames = getNames().map(name => name.toLowerCase());
    return countryNames.some(countryName => countryName.includes(name.toLowerCase()));
}
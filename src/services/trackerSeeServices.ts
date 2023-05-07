import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle
} from "discord.js";
import {
  create_entry_graph,
  get_entries
} from "./entryServices";

export const see_happiness_message = async (int: ButtonInteraction) => {
  try {
    const rows = new ActionRowBuilder < ButtonBuilder > ()
      .addComponents(
        new ButtonBuilder()
        .setCustomId('happiness-tracker-see-happiness-7d')
        .setLabel('7d')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId('happiness-tracker-see-happiness-1m')
        .setLabel('1m')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId('happiness-tracker-see-happiness-3m')
        .setLabel('3m')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId('happiness-tracker-see-happiness-6m')
        .setLabel('6m')
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId('happiness-tracker-download-data')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Download your happiness data')
      )

    const data = await get_entries({
      userId: int.user.id
    }, 30, 4)
    const graph = await create_entry_graph(data, ['week 1', 'week 2', 'week 3', 'week 4']);
    const attachment = new AttachmentBuilder(graph);

    const text = '**we\'ve created a graph for you to help you better understand your wellbeing!** \n'

    await int.reply({
      content: text,
      components: [rows],
      files: [attachment],
      ephemeral: true
    })


  } catch (err: any) {
    console.log("Err at services/trackerSeeServices.ts/see_happiness_message()");
    console.log(err);
    throw new Error(err.message);
  }
}

export const d7 = async (int: ButtonInteraction) => {
  try {
    const days = Array.from({
      length: 7
    }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      return date.toLocaleString('default', {
        weekday: 'long'
      });
    }).reverse();

    const today = days.shift();
    days.push(today as string);

    const data = await get_entries({
      userId: int.user.id
    }, 7, 7);
    
    const graph = await create_entry_graph(data, days);
    const attachment = new AttachmentBuilder(graph);

    await int.update({
      files: [attachment]
    });
  } catch (err: any) {
    console.log("Err at services/trackerSeeServices.ts/d7()");
    console.log(err);
    throw new Error(err.message);
  }
};

export const m1 = async (int: ButtonInteraction) => {
  try {
    const data = await get_entries({
      userId: int.user.id
    }, 30, 4)
    const graph = await create_entry_graph(data, ['week 1', 'week 2', 'week 3', 'week 4']);
    const attachment = new AttachmentBuilder(graph);

    await int.update({
      files: [attachment]
    })

  } catch (err: any) {
    console.log("Err at services/trackerSeeServices.ts/m1()");
    console.log(err);
    throw new Error(err.message);
  }
}

export const m3 = async (int: ButtonInteraction) => {
  try {
    const today = new Date();
    const months = Array.from({
      length: 3
    }, (_, i) => {
      const date = new Date();
      date.setMonth(today.getMonth() - 2 + i);
      return date.toLocaleString('default', {
        month: 'long'
      });
    });

    const data = await get_entries({
      userId: int.user.id
    }, 90, 3);
    const graph = await create_entry_graph(data, months);
    const attachment = new AttachmentBuilder(graph);

    await int.update({
      files: [attachment]
    });
  } catch (err: any) {
    console.log("Err at services/trackerSeeServices.ts/m3()");
    console.log(err);
    throw new Error(err.message);
  }
};

export const m6 = async (int: ButtonInteraction) => {
  try {
    const today = new Date();
    const months = Array.from({
      length: 6
    }, (_, i) => {
      const date = new Date();
      date.setMonth(today.getMonth() - 5 + i);
      return date.toLocaleString('default', {
        month: 'long'
      });
    });

    const data = await get_entries({
      userId: int.user.id
    }, 180, 6);
    const graph = await create_entry_graph(data, months);
    const attachment = new AttachmentBuilder(graph);

    await int.update({
      files: [attachment]
    });
  } catch (err: any) {
    console.log("Err at services/trackerSeeServices.ts/m6()");
    console.log(err);
    throw new Error(err.message);
  }
};
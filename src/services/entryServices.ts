import { Op, QueryTypes } from "sequelize";
import { sequelize } from "..";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export const add_entry = async (userId: string, scores: {happiness?: number, confidence?: number, healthiness?: number}) => {
    try{
        const entries_model = sequelize.model('entries');
        const users_model = sequelize.model('users');
        const date = new Date().toDateString();

        const t = await sequelize.transaction({autocommit: false});

        const [user, user_creeated] = await users_model.findOrCreate({
            where: {
                userId
            },
            defaults: {
                userId,
                lastEntryAt: Date.now() 
            },
            transaction: t
        })

        if(!user_creeated){
            await user.update({
                lastEntryAt: Date.now()
            }, {transaction: t})
        }

        let [entry, entry_created] = await entries_model.findOrCreate({
            where: {
                userId,
                date: date  
            },
            defaults: {
                userId,
                date,
                ...scores,
                time: Date.now()
            },
            transaction: t
        })

        if(!entry_created){
            entry = await entry.update({...scores}, {transaction: t});
        };
    
        try{
            t.commit();
        }catch(err: any){
            t.rollback()
            throw new Error('unable to commit a transaction, msg: ', err.message)
        }

        return entry.dataValues;

    }catch(err: any){
        console.log("Err on /services/entryService/add_entry()");
        console.log(err);
        throw new Error(err.message) 
    }
}

export const get_entries = async (data: {userId?: string}, days: number, data_points: number) => {
    try {
        const entries_model = sequelize.model('entries');

        const all = await entries_model.findAll({
            where: {
                time: {
                    [Op.gt]: Date.now() - (days * 86400000)
                },
                ...data
            }
        });

        // Calculate the number of entries per group
        const groupSize = Math.ceil(all.length / data_points);

        // Divide the array into groups and calculate the averages for each group
        const averages = [];
        for (let i = 0; i < data_points; i++) {
            const group = all.slice(i * groupSize, (i + 1) * groupSize);
            const totalHappiness = group.reduce((sum, entry) => sum + entry.dataValues.happiness, 0);
            const totalConfidence = group.reduce((sum, entry) => sum + entry.dataValues.confidence, 0);
            const totalHealthiness = group.reduce((sum, entry) => sum + entry.dataValues.healthiness, 0);
            const averageHappiness = group.length > 0 ? totalHappiness / group.length : 0;
            const averageConfidence = group.length > 0 ? totalConfidence / group.length : 0;
            const averageHealthiness = group.length > 0 ? totalHealthiness / group.length : 0;
            averages.push({happiness: averageHappiness, confidence: averageConfidence, healthiness: averageHealthiness});
        }

        return averages;
    } catch (err: any) {
        console.log("Err on /services/entryService/get_entry()");
        console.log(err);
        throw new Error(err.message);
    }
};


export const create_entry_graph = async (data: any[], labels: string[]) => {
    try{
        const canvas = new ChartJSNodeCanvas({height: 200, width: 372, backgroundColour: 'black'})

        const img = (await canvas.renderToBuffer({
            type: "line",
            data: {
                labels: [...labels],
                datasets: [
                    {
                        label: 'Happiness',
                        data: [...data.map(v => v.happiness).reverse() as number[]],
                        fill: false,
                        borderColor: ['yellow'],
                        borderWidth: 1,
                        xAxisID: 'xAxis1'
                    },
    
                    {
                        label: 'Healthiness',
                        data: [...data.map(v => v.healthiness).reverse() as number[]],
                        fill: false,
                        borderColor: ['rgb(255, 102, 255)'],
                        borderWidth: 1,
                        xAxisID: 'xAxis1'
                    },
    
                    {
                        label: 'Confidence',
                        data: [...data.map(v => v.confidence).reverse() as number[]],
                        fill: false,
                        borderColor: ['rgb(51, 204, 204)'],
                        borderWidth: 1,
                        xAxisID: 'xAxis1'
                    },
    
                ]
            },
            options: {
                devicePixelRatio: 2,
                scales: {
                    y: {
                        min: 1,
                        max: 5
                    }
                }
            }
        }))
        
        return img;
    }catch(err: any){
        console.log("Err on /services/entryService/create_entry_graph()");
        console.log(err);
        throw new Error(err.message) 
    }
}


export const download_data = async (userId: string): Promise<Buffer> => {
    try {
      const query = `
        SELECT userId, happiness, healthiness, confidence, date, time
        FROM entries
        WHERE userId = :userId
      `;
      const entries = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId },
        raw: true
      });
  
      const csv = "userId,happiness,healthiness,confidence,date,time\n" +
        entries.map((entry: any) => `${entry.userId},${entry.happiness},${entry.healthiness},${entry.confidence},${entry.date},${entry.time}`).join('\n');
  
      return Buffer.from(csv);
    } catch (err: any) {
      console.log("Err on /services/entryService/download_data()");
      console.log(err);
      throw new Error(err.message);
    }
};
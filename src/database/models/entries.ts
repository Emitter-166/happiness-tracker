import { Sequelize, INTEGER, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('entries', {
        userId: {
            type: CHAR(25),
            allowNull: false
        },
        happiness: {
            type: INTEGER,
            defaultValue: 0
        },
        healthiness: {
            type: INTEGER,
            defaultValue: 0
        },
        confidence: {
            type: INTEGER,
            defaultValue: 0
        },
        date: {
            type: CHAR(255)
        }, 
        time: {
            type: INTEGER
        }
    }, {timestamps: false})
}
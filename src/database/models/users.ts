import { Sequelize, INTEGER, CHAR, BOOLEAN } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('users', {
        userId: {
            type: CHAR(25),
            allowNull: false
        },
        age: {
            type: INTEGER
        },
        gender: {
            type: CHAR(5)
        },
        country: {
            type: CHAR(255)
        },
        lastEntryAt: {
            type: INTEGER,
            defaultValue: 0
        },
        reminded: {
            type: BOOLEAN,
            defaultValue: false
        }
    }, {timestamps: false})
}
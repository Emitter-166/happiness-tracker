import { Sequelize, INTEGER, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('users', {
        userId: {
            type: CHAR(25),
            allowNull: false
        },
        lastEntryAt: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {timestamps: false})
}
import { Sequelize, INTEGER, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('entries', {
        userId: {
            type: CHAR(25)
        }
    }, {timestamps: false})
}
import { DataTypes } from 'sequelize';
import sequelize from '../config/SqliteConnection';

const Room = sequelize.define(
    'Room',
    {
        id: {
            type: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: DataTypes.STRING,
    },
    { freezeTableName: true },
);

export { Room };

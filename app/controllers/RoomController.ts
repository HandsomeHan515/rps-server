import crypto from 'crypto';
import { Room } from '../models/Room';

const createRoom = async (name: string) => {
    await Room.sync(); // create table, if table already exists, don't need sync
    return Room.create({ name, id: crypto.randomUUID() });
};

const getRoomList = () => Room.findAll();

const removeRoom = (roomId: string) => Room.destroy({ where: { id: roomId } });

export default { createRoom, getRoomList, removeRoom };

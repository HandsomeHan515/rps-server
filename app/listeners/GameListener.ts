import { Server, Socket } from 'socket.io';
import { GamePlayerList } from '../modules/GamePlayerListClass';

const PlayerList = GamePlayerList.gamePlayerList;
const MAX_NUM_IN_ROOM = 2;

const GameListener = (io: Server, socket: Socket) => {
    const getRoomClients = (roomId: string) => {
        const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
        // current room client number
        return clientsInRoom ? clientsInRoom.size : 0;
    };

    const joinGame = (roomId: string, userId: string) => {
        if (getRoomClients(roomId) === MAX_NUM_IN_ROOM) {
            socket.emit('game:full', roomId);
        } else {
            socket.join(roomId);
            if (PlayerList[roomId]) {
                PlayerList[roomId][userId] = { userId };
            } else {
                PlayerList[roomId] = {};
                PlayerList[roomId][userId] = { userId };
            }
            if (getRoomClients(roomId) === MAX_NUM_IN_ROOM) {
                io.to(roomId).emit('game:startPlay', roomId);
            }
        }
    };

    const sendPicking = (roomId: string, userId: string, type: string) => {
        if (PlayerList[roomId][userId]) {
            PlayerList[roomId][userId].gameType = type;
            const completPlay = Object.values(PlayerList[roomId]).every(({ gameType }) => !!gameType);
            if (completPlay) {
                io.to(roomId).emit('game:completePlay', Object.values(PlayerList[roomId]));
            }
        }
    };

    const leaveGame = (userId: string) => {
        try {
            const userRoomId = Object.keys(PlayerList).find((roomId) => Object.prototype.hasOwnProperty.call(PlayerList[roomId], userId));
            if (userRoomId) {
                delete PlayerList[userRoomId][userId];
                // clear all players picking
                Object.keys(PlayerList[userRoomId]).forEach((userId) => {
                    delete PlayerList[userRoomId][userId].gameType;
                });
                socket.leave(userRoomId);
                socket.to(userRoomId).emit('game:cancelPlay', userId);
            }
        } catch (error: unknown) {
            console.error(error);
        }
    };

    socket.on('game:join', joinGame);
    socket.on('game:sendPicking', sendPicking);
    socket.on('game:leave', leaveGame);
};

export default GameListener;

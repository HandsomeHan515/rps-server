import { Server, Socket } from 'socket.io';
import { GamePlayerList } from '../modules/GamePlayerListClass';

const PlayerList = GamePlayerList.gamePlayerList;

const GameListener = (io: Server, socket: Socket) => {
    socket.on('game:join', (room: string, user: string) => {
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        // current room client number
        const numClients = clientsInRoom ? clientsInRoom.size : 0;

        if (numClients === 0) {
            // no player in this room
            PlayerList[room][socket.id] = { userId: user };
            socket.join(room); // first player
        } else if (numClients === 1) {
            PlayerList[room][socket.id] = { userId: user };
            socket.join(room); // second play
            io.in(room).emit('game:startPlay', room);
        } else {
            socket.emit('game:roomIsFull', room);
        }
    });

    socket.on('game:leave', (room: string) => {
        socket.leave(room);
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        // current room client number
        const numClients = clientsInRoom ? clientsInRoom.size : 0;
        if (numClients === 2) {
            // client is full
        } else {
            if (PlayerList[room][socket.id]) {
                delete PlayerList[room][socket.id];
            }
            socket.to(room).emit('game:cancelPlay', room);
            console.log('leave room', PlayerList);
        }
    });

    socket.on('game:select', ({ type, room }) => {
        PlayerList[room][socket.id].gameType = type;
        if (Object.keys(PlayerList[room]).length > 1) {
            // 两个人都完成选项后，向客户端发送结果
            io.in(room).emit('game:completePlay', { room, users: PlayerList[room] });
        }
    });
};

export default GameListener;

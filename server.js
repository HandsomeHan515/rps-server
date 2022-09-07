const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const { rooms } = require('./mock');
const io = new Server(server);
// 处理 post body
app.use(bodyparser.json())


// `CORS`主要的实现方式是服务端通过对响应头的设置，接收跨域请求的处理。
app.all('*', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GEt,POST,PUT')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Content-Type', 'application/json;charset=utf-8')
    req.next()
})

app.get('/room/list', (req, res) => {
    res.json({
        success: true,
        data: rooms
    })
})

app.post('/room/addRoom', (req, res) => {
    console.log('req', req.body);
    const id = new Date().getTime()
    rooms.push({ ...req.body, id })
    res.json({
        success: true,
        data: [id]
    })
})

const actionMap = {}
io.on('connection', socket => {
    console.log('a user connected', socket.id);

    socket.on('join', room => {
        actionMap[room] = {}
        const clientsInRoom = io.sockets.adapter.rooms.get(room)
        // current room client number
        const numClients = clientsInRoom ? clientsInRoom.size : 0

        if (numClients === 0) { // no player in this room
            socket.join(room) // first player
        } else if (numClients === 1) {
            socket.join(room) // second play
            // 给该房间所有人发消息，开始游戏
            io.in(room).emit('start play', room)
        } else {
            socket.emit('room full', room)
        }

        console.log('rooms', io.sockets.adapter.rooms.get(room));
    })

    socket.on('leave', room => {
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        // current room client number
        const numClients = clientsInRoom ? clientsInRoom.size : 0
        if (numClients === 2) {
            // client is full
        } else {
            socket.leave(room)
            // 当前房间 数据清空
            actionMap[room] = {}
            // 除本连接外，给某个房间内所有人发消息
            socket.to(room).emit('cancel play', room)
            console.log('leave room', io.sockets.adapter.rooms.get(room), actionMap);
        }
    })

    socket.on('select', ({ type, room, user }) => {
        actionMap[room][user] = type
        console.log('server select', actionMap);
        if (Object.keys(actionMap[room]).length > 1) {
            // 两个人都完成选项后，向客户端发送结果
            console.log('complete play');
            io.in(room).emit('complete play', { room, users: actionMap[room] });
        }
    })

    socket.on('disconnect', () => {
        console.log('server disconnect');
    })
});



server.listen(9001, () => {
    console.log('listening on *:9001');
});

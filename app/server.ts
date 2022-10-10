import path from 'path';
import http from 'http';
import express, { Express, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import dotEnv from 'dotenv';
import cors from 'cors';
import * as OpenApiValidator from 'express-openapi-validator';
import { router as RoomRoutes } from './routes/RoomApi';
import GameListener from './listeners/GameListener';

dotEnv.config({ path: path.resolve(__dirname, './config/.env') });
const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TS + OpenApi + Socket.io Server');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    OpenApiValidator.middleware({
        apiSpec: './openapi.yaml',
        validateRequests: true, // (default)
        validateResponses: false, // false by default
    }),
);

app.use(
    cors({
        origin: 'https://rps-game-dev.herokuapp.com',
        credentials: true,
    }),
);

app.use('/room', RoomRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://rps-game-dev.herokuapp.com',
        credentials: true,
    },
});

io.on('connection', (socket: Socket) => {
    console.log('User with socketId %s connected', socket.id);
    GameListener(io, socket);
});

io.on('disconnect', (socket: Socket) => {
    console.log('User with socketId %s disconnected', socket.id);
    GameListener(io, socket);
});

server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

import path from 'path';
import http from 'http';
import express, { Express, NextFunction, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import dotEnv from 'dotenv';
import * as OpenApiValidator from 'express-openapi-validator';
import { router as RoomRoutes } from './routes/RoomApi';
import GameListener from './listeners/GameListener';

dotEnv.config({ path: path.resolve(__dirname, './config/.env') });
const app: Express = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    OpenApiValidator.middleware({
        apiSpec: './openapi.yaml',
        validateRequests: true, // (default)
        validateResponses: true, // false by default
    }),
);

app.all('*', function (req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TS server');
});

app.use('/room', RoomRoutes);

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket: Socket) => {
    console.log('User with socketId %s connected', socket.id);
    GameListener(io, socket);
});

io.on('disconnect', (socket: Socket) => {
    console.log('User with socketId %s disconnected', socket.id);
    GameListener(io, socket);
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

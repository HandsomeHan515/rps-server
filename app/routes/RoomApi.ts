import { Response, Request, NextFunction } from 'express';
import express from 'express';
import { MissingParamenter } from '../utils/Errors';
import RoomController from '../controllers/RoomController';

export const router = express.Router();

router.post('/', (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.name) {
        next(new MissingParamenter('name is required to create room'));
    } else {
        const { name } = req.body;
        RoomController.createRoom(name)
            .then(() => res.json({ success: true }))
            .catch((err) => {
                throw err;
            });
    }
});

router.get('/', (req: Request, res: Response) => {
    RoomController.getRoomList().then((rooms) => {
        res.json(rooms);
    });
});

router.delete('/:roomId', (req: Request, res: Response, next: NextFunction) => {
    const roomId = req.params.roomId;
    if (!roomId) {
        next(new MissingParamenter('roomId is required to create room'));
    } else {
        RoomController.removeRoom(roomId).then(() => {
            res.status(204);
            res.json();
        });
    }
});

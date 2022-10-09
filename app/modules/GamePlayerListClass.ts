interface PlayerInfo {
    userId: string;
    gameType?: string;
}

interface PlayerInfoList {
    [key: string]: {
        [key: string]: PlayerInfo;
    };
}

class GamePlayerListClass {
    public gamePlayerList: PlayerInfoList = {};
}

export const GamePlayerList = new GamePlayerListClass();

export interface IUpdateBody {
    teams: ReadonlyArray<{
        players: ReadonlyArray<string>;
        score: number;
    }>;
}

export interface IDbGame {
    teams: ReadonlyArray<ReadonlyArray<string>>;
    score: ReadonlyArray<number>;
    newElos: Record<string, number>;
    verdict: ReadonlyArray<number>;
    creationDate: Date;
}

export interface IDbUser {
    _id: string;
    username: string;
    elo: number;
}

export interface IResult {
    players: ReadonlyArray<{
        username: string;
        elo: number;
    }>;
    verdict: number;
    score: number;
}

export interface IUserRequest {
    username: string;
    userOffice: string;
}

export interface IUser {
    _id: string;
    username: string;
    elo: number;
    userOffice: string;
}

export type IUsersResponse = ReadonlyArray<IUser>;

export interface I1v1GameForm {
    teamOnePlayerOne: string;
    teamTwoPlayerOne: string;
    teamOneScore: number;
    teamTwoScore: number;
}

export interface IGameForm {
    teamOnePlayerOne: string;
    teamOnePlayerTwo: string;
    teamTwoPlayerOne: string;
    teamTwoPlayerTwo: string;
    teamOneScore: number;
    teamTwoScore: number;
}

export interface IGameRequest {
    teams: ReadonlyArray<{
        players: ReadonlyArray<string>;
        score: number;
    }>;
}

export interface IGame {
    _id: string;
    creationDate: string;
    newElos: {
        [username: string]: number;
    };
    score: ReadonlyArray<number>;
    teams: ReadonlyArray<ReadonlyArray<string>>;
}

export type IGamesResponse = ReadonlyArray<IGame>;

export interface IUpdateResponse {
    users: IUsersResponse;
    games: IGamesResponse;
}

export type AllStatsResponse = Record<string, IAllStats>;

export interface IAllStats {
    gamesCount: number;
    wins: number;
    winPer: number;
    results: ReadonlyArray<IStatResult>;
}

export interface IStatResult {
    _id: string;
    creationDate: string;
    username: string;
    myScore: number;
    myVerdict: number;
}

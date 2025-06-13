import EloRank from "elo-rank";
import { Handler } from "aws-lambda";
import { IDbGame, IDbUser, IResult, IUpdateBody } from "./types";
import { MongoClient, Db } from "mongodb";

const USER_COLLECTION = "users2";
const GAME_COLLECTION = "games2";

const elo = new EloRank();
const K_FACTOR = 5;
const K_MOD_CONST = 0.004; //  1/240

// Replace the following with your Atlas connection string
const MONGODB_URI = "%MONGO_SECRET%";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToClient() {
    if (cachedClient) {
        return cachedClient;
    }

    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient.connect(MONGODB_URI);

    cachedClient = client;

    return client;
}

export async function connectToDatabase(isTest: boolean) {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await connectToClient();

    const db = await client.db(isTest ? "felo_test" : "felo");

    cachedDb = db;

    return cachedDb;
}

export async function closeConnection() {
    if (!cachedClient) {
        return;
    }

    cachedClient.close();

    cachedClient = null;
    cachedDb = null;
}

export async function updateUserInDB(
    username: string,
    elo: number,
    isTest: boolean
) {
    const db = await connectToDatabase(isTest);
    const col = db.collection<IDbUser>(USER_COLLECTION);
    await col.updateOne(
        { username: username },
        {
            $set: {
                elo: elo,
            },
        }
    );
}

export async function saveGames(games: IDbGame[], isTest: boolean) {
    const db = await connectToDatabase(isTest);
    const col = db.collection<IDbGame>(GAME_COLLECTION);
    await col.insertMany(games);
}

export async function updateElos(
    newElos: Record<string, number>,
    isTest: boolean
) {
    for (let username of Object.keys(newElos)) {
        await updateUserInDB(username, newElos[username], isTest);
    }
}

export async function retrievePlayersFromDB(
    usernames: ReadonlyArray<string>,
    isTest: boolean
) {
    const db = await connectToDatabase(isTest);
    const users = db.collection<IDbUser>(USER_COLLECTION);
    const query = { username: { $in: usernames } };
    return await users.find(query).toArray();
}

async function retrievePlayerDictionaryFromDB(
    usernames: ReadonlyArray<string>,
    isTest: boolean
) {
    const dbPlayers = await retrievePlayersFromDB(usernames, isTest);

    const dbPlayersMap: Record<string, IDbUser> = dbPlayers.reduce(
        (acc, player) => ({
            ...acc,
            [player.username]: player,
        }),
        {}
    );

    return dbPlayersMap;
}

export const calculateElos = (results: ReadonlyArray<IResult>) => {
    const scoreDiff = Math.abs(results[0].score - results[1].score);
    const kFactor = K_FACTOR * (scoreDiff + 5);
    const modKFactor = kFactor * Math.exp(-1 * scoreDiff * K_MOD_CONST);

    elo.setKFactor(modKFactor);

    const teamElos = results.map(
        (result) =>
            result.players.reduce((sum, player) => sum + player.elo, 0) /
            result.players.length
    );

    const expectedScores = [
        elo.getExpected(teamElos[0], teamElos[1]),
        elo.getExpected(teamElos[1], teamElos[0]),
    ];

    const newElos: Record<string, number> = {};

    results.forEach((result, resultIndex) => {
        result.players.forEach((player) => {
            newElos[player.username] = elo.updateRating(
                expectedScores[resultIndex],
                result.verdict,
                player.elo
            );
        });
    });

    return newElos;
};

export const handleSubmitedGames = (
    games: ReadonlyArray<IUpdateBody>,
    dbUsers: ReadonlyArray<IDbUser>
) => {
    const gamesToSave: IDbGame[] = [];
    let newElos: Record<string, number> = {};

    games.forEach((game) => {
        const usernames = game.teams.flatMap((team) => team.players);

        const team1 = game.teams[0].score;
        const team2 = game.teams[1].score;

        // a draw is represented by 0.5, win 1, loss 0
        let verdict = [0.5, 0.5];

        if (team1 > team2) {
            verdict = [1, 0];
        } else if (team1 < team2) {
            verdict = [0, 1];
        }

        const results: ReadonlyArray<IResult> = game.teams.map((team, i) => ({
            players: team.players.map((username) => {
                let elo = newElos?.[username];

                if (elo === undefined) {
                    const user = dbUsers.find(
                        (dbUser) => dbUser.username === username
                    );

                    if (!user) {
                        throw new Error(
                            "Supplied username doesnt exist in the database!"
                        );
                    }

                    elo = user.elo;
                }

                return {
                    username,
                    elo,
                };
            }),
            verdict: verdict[i],
            score: team.score,
        }));

        newElos = {
            ...newElos,
            ...calculateElos(results),
        };

        const teams = [];
        if (usernames.length == 2) {
            teams.push([usernames[0]]);
            teams.push([usernames[1]]);
        } else {
            teams.push([usernames[0], usernames[1]]);
            teams.push([usernames[2], usernames[3]]);
        }

        gamesToSave.push({
            teams: teams,
            score: [game.teams[0].score, game.teams[1].score],
            newElos,
            verdict: verdict,
            creationDate: new Date(),
        });
    });

    return {
        gamesToSave,
        newElos,
    };
};

export const augmentUsers = (
    dbUsers: IDbUser[],
    newElos: Record<string, number>
) => {
    const augmentedUsers = [...dbUsers];

    Object.keys(newElos).forEach((username) => {
        const dbIndex = augmentedUsers.findIndex(
            (dbUser) => dbUser.username === username
        );

        if (dbIndex > -1) {
            augmentedUsers[dbIndex] = {
                ...augmentedUsers[dbIndex],
                elo: newElos[username],
            };
        }
    });

    return augmentedUsers;
};

export const handler: Handler = async (event, context) => {
    const queries = event.queryStringParameters;
    const isTest = queries?.test === "true";

    /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
    context.callbackWaitsForEmptyEventLoop = false;

    const games: ReadonlyArray<IUpdateBody> = JSON.parse(event.body) ?? "";

    const db = await connectToDatabase(isTest);
    let dbUsers = await db
        .collection<IDbUser>(USER_COLLECTION)
        .find({})
        .sort({ elo: -1 })
        .toArray();

    const { gamesToSave, newElos } = handleSubmitedGames(games, dbUsers);

    await saveGames(gamesToSave, isTest);

    await updateElos(newElos, isTest);

    dbUsers = augmentUsers(dbUsers, newElos);

    const dbGames = await db
        .collection<IDbGame>(GAME_COLLECTION)
        .find({})
        .sort({ creationDate: -1 })
        .limit(6)
        .toArray();

    const responseBody = {
        users: dbUsers,
        games: dbGames,
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(responseBody),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    await closeConnection();

    return response;
};

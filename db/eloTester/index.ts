import EloRank = require("elo-rank");
import {Db, MongoClient} from "mongodb";

const elo = new EloRank();

const STARTING_ELO = 1000;
const K_FACTOR = 50;

const MONGODB_URI = 'mongodb+srv://tomxmclaughlan:crokinole2024@crokinole.xgvpj.mongodb.net/?retryWrites=true&w=majority&appName=crokinole';

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

export async function main() {
    const db = await connectToDatabase(true);
    let users = await db.collection("users")
        .find({})
        .toArray();

    users.forEach(user => {
        user.elo = STARTING_ELO
    });

    let games = await db.collection("games")
        .find({})
        .sort({ creationDate: 1 })
        .toArray();

    games.forEach(game => {
        const kFactor = Math.abs(game.score[0] - game.score[1]);

        elo.setKFactor(kFactor * K_FACTOR);

        const teamElos = game.teams.map((team: string[]) => {
            return team.reduce((sum, user) => sum + users.find(u => u.username === user).elo, 0) / team.length
        });

        const verdict = game.score[0] > game.score[1] ? [1, 0] : [0, 1];

        const expectedScores = [
            elo.getExpected(teamElos[0], teamElos[1]),
            elo.getExpected(teamElos[1], teamElos[0]),
        ];

        const newElos = {};

        game.teams.forEach((team, i) => {
            team.forEach(player => {
                newElos[player] = elo.updateRating(
                    expectedScores[i],
                    verdict[i],
                    users.find(u => u.username === player).elo
                );
            });
        });

        for (let user in newElos) {
            users.find(u => u.username === user).elo = newElos[user];
        }

        db.collection("games").updateOne({ _id: game._id }, { $set: { newElos: newElos }});
    });

    users.forEach(user => {
        db.collection("users").updateOne({ _id: user._id }, { $set: { elo: user.elo }});
    });
}

main();
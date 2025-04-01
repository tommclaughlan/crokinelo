// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;

// Replace the following with your Atlas connection string
const MONGODB_URI = "%MONGO_SECRET%";

const GAMES_COLLECTION = "games2";

let cachedClient = null;
let cachedDb = null;

async function connectToClient() {
    if (cachedClient) {
        return cachedClient;
    }

    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient.connect(MONGODB_URI);

    cachedClient = client;

    return client;
}

async function connectToDatabase(isTest) {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await connectToClient();

    const db = await client.db(isTest ? "felo_test" : "felo");

    cachedDb = db;

    return cachedDb;
}

async function closeConnection() {
    if (!cachedClient) {
        return;
    }

    cachedClient.close();

    cachedClient = null;
    cachedDb = null;
}

exports.handler = async (event, context) => {
    const isTest = event.queryStringParameters?.test === "true";

    /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
    context.callbackWaitsForEmptyEventLoop = false;

    const db = await connectToDatabase(isTest);
    const stats = await db
        .collection(GAMES_COLLECTION)
        .aggregate([
            {
                $unwind: {
                    path: "$teams",
                    includeArrayIndex: "teamIndex",
                },
            },
            {
                $unwind: {
                    path: "$teams",
                },
            },
            {
                $project: {
                    username: "$teams",
                    creationDate: 1,
                    myScore: {
                        $arrayElemAt: ["$score", "$teamIndex"],
                    },
                    myVerdict: {
                        $arrayElemAt: ["$verdict", "$teamIndex"]
                    }
                },
            },
            {
                $group: {
                    _id: "$username",
                    gamesCount: {
                        $sum: 1,
                    },
                    wins: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$myVerdict", 1],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    ties: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$myVerdict", 0.5],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    losses: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$myVerdict", 0],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    results: {
                        $push: "$$ROOT",
                    },
                },
            },
            {
                $addFields: {
                    winPer: {
                        $divide: ["$wins", "$gamesCount"],
                    },
                    results: {
                        $sortArray: {
                            input: "$results",
                            sortBy: {
                                creationDate: -1,
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: { k: "$_id", v: "$$ROOT" },
                    },
                },
            },
            {
                $project: { data: { $arrayToObject: "$data" } },
            },
            {
                $replaceRoot: {
                    newRoot: "$data",
                },
            },
        ])
        .toArray();

    const statDictionary = stats.length >= 1 ? stats[0] : {};

    const response = {
        statusCode: 200,
        body: JSON.stringify(statDictionary),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    await closeConnection();

    return response;
};

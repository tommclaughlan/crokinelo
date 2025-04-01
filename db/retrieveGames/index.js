// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

// Replace the following with your Atlas connection string
const MONGODB_URI = "%MONGO_SECRET%";

const USERS_COLLECTION = "users2";
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

async function getUser(id, isTest) {
    const db = await connectToDatabase(isTest);

    return db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) });
}

exports.handler = async (event, context) => {
    const queries = event.queryStringParameters;

    const isTest = queries?.test === "true";

    const userId = queries?.userId;

    /* By default, the callback waits until the runtime event loop is empty before freezing the process and returning the results to the caller. Setting this property to false requests that AWS Lambda freeze the process soon after the callback is invoked, even if there are events in the event loop. AWS Lambda will freeze the process, any state data, and the events in the event loop. Any remaining events in the event loop are processed when the Lambda function is next invoked, if AWS Lambda chooses to use the frozen process. */
    context.callbackWaitsForEmptyEventLoop = false;

    let user = null;

    if (userId) {
        user = await getUser(userId, isTest);
    }

    if (userId && !user) {
        const response = {
            statusCode: 404,
            body: JSON.stringify("User not found"),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

        await closeConnection();

        return response;
    }

    const searchCriteria = user
        ? {
              teams: {
                  $elemMatch: {
                      $elemMatch: {
                          $eq: user.username,
                      },
                  },
              },
          }
        : {};

    const db = await connectToDatabase(isTest);
    const games = await db
        .collection(GAMES_COLLECTION)
        .find(searchCriteria)
        .sort({ creationDate: -1 })
        .limit(user ? 20 : 6)
        .toArray();

    const response = {
        statusCode: 200,
        body: JSON.stringify(games),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    await closeConnection();

    return response;
};

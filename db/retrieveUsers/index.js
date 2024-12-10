// Import the MongoDB driver
const MongoClient = require("mongodb").MongoClient;

// Replace the following with your Atlas connection string
const MONGODB_URI = "%MONGO_SECRET%";

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
    const users = await db
        .collection("users")
        .find({ inactive: { $ne: true } })
        .sort({ elo: -1 })
        .toArray();

    const response = {
        statusCode: 200,
        body: JSON.stringify(users),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    await closeConnection();

    return response;
};

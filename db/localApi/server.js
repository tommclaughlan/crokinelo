const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());

const lambdaHandlers = {
  getUsers: require("./functions/retrieveUsers/index.js").handler,
  retrieveGames: require("./functions/retrieveGames/index.js").handler,
  retrieveAllStats: require("./functions/retrieveAllStats/index.js").handler,
  registerUser: require("./functions/registerUser/index.js").handler,
  updateElo: require("./functions/updateElo/built/index.js").handler,
};

app.get("/health", (_req, res) => res.sendStatus(200));

for (const [functionName, handler] of Object.entries(lambdaHandlers)) {
  app.all(`/${functionName}`, async (req, res, next) => {
    try {
      const event = {
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: Object.keys(req.query).length ? req.query : null,
        headers: req.headers,
        body:
          req.method === "GET" || req.body === undefined
            ? null
            : JSON.stringify(req.body),
      };
      const context = {
        callbackWaitsForEmptyEventLoop: true,
        functionName,
        awsRequestId: `local-${Date.now()}`,
      };
      const response = await handler(event, context);

      if (!response || !Number.isInteger(response.statusCode)) {
        throw new Error(`Lambda ${functionName} returned an invalid response`);
      }

      for (const [name, value] of Object.entries(response.headers || {})) {
        res.set(name, value);
      }
      res.status(response.statusCode).send(response.body ?? "");
    } catch (error) {
      next(error);
    }
  });
}

app.use((error, _req, res, _next) => {
  console.error("Local Lambda invocation failed", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Local Lambda emulator listening on port ${PORT}`);
});

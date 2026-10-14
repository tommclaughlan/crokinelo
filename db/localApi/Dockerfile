FROM node:20-alpine AS build

WORKDIR /app

COPY db/localApi/package*.json ./
RUN npm ci

COPY db/localApi/server.js ./
COPY db/registerUser/index.js ./functions/registerUser/index.js
COPY db/retrieveUsers/index.js ./functions/retrieveUsers/index.js
COPY db/retrieveGames/index.js ./functions/retrieveGames/index.js
COPY db/retrieveAllStats/index.js ./functions/retrieveAllStats/index.js
COPY db/updateElo/index.ts db/updateElo/types.ts db/updateElo/tsconfig.json ./functions/updateElo/
RUN npm run compile-lambdas

FROM node:20-alpine

WORKDIR /app

COPY db/localApi/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server.js ./
COPY --from=build /app/functions ./functions

EXPOSE 3001

CMD ["npm", "start"]

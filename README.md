# Crokinelo

## Run locally with Docker

Docker Compose runs the React app, the existing Lambda handlers through a
local HTTP adapter, and MongoDB with sample users and games. The handlers use
the local MongoDB container and do not require Atlas credentials or AWS.

1. Install and start Docker Desktop.
2. From the repository root, run:

   ```sh
   docker compose up --build
   ```

3. Open [http://localhost:8080](http://localhost:8080).

The Lambda handlers are compiled/packaged into the API container and invoked
for the same `getUsers`, `retrieveGames`, `retrieveAllStats`, `registerUser`,
and `updateElo` routes used by the frontend. The sample data is loaded into
both the normal and test databases. Registering users or submitting scores
changes the local database only. To stop the app,
run `docker compose down`; data persists in the `mongo-data` volume. To reset
the local database and reload the samples, run `docker compose down --volumes`
and then start the stack again.

The regular hosted setup remains the default outside Docker.
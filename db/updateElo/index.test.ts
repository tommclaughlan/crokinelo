import { augmentUsers, calculateElos, handleSubmitedGames } from "./index";
import {IDbUser, IResult} from "./types";
import {ObjectId} from "mongodb";

const dbUsers: IDbUser[] = [
    {
        _id: new ObjectId("111111111111"),
        username: "Andy",
        elo: 1000,
    },
    {
        _id: new ObjectId("222222222222"),
        username: "Turbo",
        elo: 1000,
    },
    {
        _id: new ObjectId("333333333333"),
        username: "Neo",
        elo: 1000,
    },
    {
        _id: new ObjectId("444444444444"),
        username: "Casio",
        elo: 1000,
    },
    {
        _id: new ObjectId("555555555555"),
        username: "JK",
        elo: 1000,
    },
];

describe("index.ts", () => {
    describe("calculateElos", () => {
        it("should calculate the correct new elos", () => {
            const playerOneUsername = "Andestructazoid";
            const playerTwoUsername = "Turbo";
            const playerThreeUsername = "Casio";
            const playerFourUsername = "XxSharkTaleFan2k12xX";

            const results: ReadonlyArray<IResult> = [
                {
                    players: [
                        {
                            username: playerOneUsername,
                            elo: 1000,
                        },
                        {
                            username: playerTwoUsername,
                            elo: 1000,
                        },
                    ],
                    verdict: 1,
                    score: 10,
                },
                {
                    players: [
                        {
                            username: playerThreeUsername,
                            elo: 1000,
                        },
                        {
                            username: playerFourUsername,
                            elo: 1000,
                        },
                    ],
                    verdict: 0,
                    score: 0,
                },
            ];

            const newElos = calculateElos(results);

            expect(Object.keys(newElos).length).toEqual(4);
            expect(newElos[playerOneUsername]).toEqual(1036);
            expect(newElos[playerTwoUsername]).toEqual(1036);
            expect(newElos[playerThreeUsername]).toEqual(964);
            expect(newElos[playerFourUsername]).toEqual(964);
        });
    });

    describe("handleSubmitedGames", () => {
        const createGame = (usernames: ReadonlyArray<string>) => ({
            teams: [
                {
                    players: [usernames[0], usernames[1]],
                    score: 10,
                },
                {
                    players: [usernames[2], usernames[3]],
                    score: 0,
                },
            ],
        });

        it("should return a list of updated elos - solo game", () => {
            const games = [createGame(["Andy", "Turbo", "Casio", "Neo"])];

            const { newElos } = handleSubmitedGames(games, dbUsers);

            expect(Object.keys(newElos).length).toEqual(4);
            expect(newElos["Andy"]).toEqual(1036);
            expect(newElos["Turbo"]).toEqual(1036);
            expect(newElos["Casio"]).toEqual(964);
            expect(newElos["Neo"]).toEqual(964);
        });

        it("should return a list of updated elos - multiple games", () => {
            const games = [
                createGame(["Andy", "Turbo", "Casio", "Neo"]),
                createGame(["Andy", "Turbo", "Casio", "Neo"]),
                createGame(["Andy", "Turbo", "Casio", "Neo"]),
            ];

            const { newElos } = handleSubmitedGames(games, dbUsers);

            expect(Object.keys(newElos).length).toEqual(4);
            expect(newElos["Andy"]).toEqual(1088);
            expect(newElos["Turbo"]).toEqual(1088);
            expect(newElos["Casio"]).toEqual(912);
            expect(newElos["Neo"]).toEqual(912);
        });

        it("should return a list of updated elos - more than four users", () => {
            const games = [
                createGame(["Andy", "Turbo", "Casio", "Neo"]),
                createGame(["Andy", "Turbo", "Casio", "Neo"]),
                createGame(["Andy", "Turbo", "Casio", "JK"]),
            ];

            const { newElos } = handleSubmitedGames(games, dbUsers);

            expect(Object.keys(newElos).length).toEqual(5);
            expect(newElos["Andy"]).toEqual(1091);
            expect(newElos["Turbo"]).toEqual(1091);
            expect(newElos["Casio"]).toEqual(912);
            expect(newElos["Neo"]).toEqual(935);
            expect(newElos["JK"]).toEqual(971);
        });

        it("should throw an error if username isnt in the database", () => {
            const games = [createGame(["fake", "user", "names", "here"])];

            expect(() => handleSubmitedGames(games, dbUsers)).toThrow(Error);
            expect(() => handleSubmitedGames(games, dbUsers)).toThrow(
                "Supplied username doesnt exist in the database!"
            );
        });
    });

    describe("augmentUsers", () => {
        it("should update users with their new elos", () => {
            const augmentedUsers = augmentUsers(dbUsers, {
                Andy: 1001,
                Turbo: 1002,
            });

            expect(augmentedUsers.length).toEqual(dbUsers.length);
            expect(augmentedUsers[0].elo).toEqual(1001);
            expect(augmentedUsers[1].elo).toEqual(1002);
        });

        it("should not update a user that doesnt exist", () => {
            const augmentedUsers = augmentUsers([dbUsers[0]], {
                Goldfish: 1001,
            });

            expect(augmentedUsers.length).toEqual(1);
            expect(augmentedUsers[0].elo).toEqual(1000);
        });
    });

    describe("handler", () => {
        describe("when test is true", () => {
            it("should use the test database", () => {});
        });

        describe("when test is false", () => {
            it("should use the prod database", () => {});
        });

        it("should update the users collection", () => {});

        it("should update the games collection", () => {});

        it("should return the new last 6 games", () => {});

        it("should return the users with the new elo ratings", () => {});

        it("should return the users collection in elo order", () => {});
    });
});

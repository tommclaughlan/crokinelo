const demoUsers = [
  { username: "Alex Morgan", elo: 1142, userOffice: "London" },
  { username: "Jamie Taylor", elo: 1086, userOffice: "London" },
  { username: "Casey Lee", elo: 1018, userOffice: "Manchester" },
  { username: "Riley Jordan", elo: 954, userOffice: "Manchester" },
  { username: "Sam Patel", elo: 1000, userOffice: "London" },
  { username: "Morgan Reed", elo: 1000, userOffice: "Manchester" },
];

const demoGames = [
  { teams: [["Alex Morgan", "Jamie Taylor"], ["Casey Lee", "Riley Jordan"]], score: [10, 5], verdict: [1, 0], newElos: { "Alex Morgan": 1142, "Jamie Taylor": 1086, "Casey Lee": 1018, "Riley Jordan": 954 } },
  { teams: [["Sam Patel"], ["Morgan Reed"]], score: [5, 5], verdict: [0.5, 0.5], newElos: { "Sam Patel": 1000, "Morgan Reed": 1000 } },
  { teams: [["Alex Morgan", "Casey Lee"], ["Jamie Taylor", "Riley Jordan"]], score: [5, 10], verdict: [0, 1], newElos: { "Alex Morgan": 1142, "Casey Lee": 1018, "Jamie Taylor": 1086, "Riley Jordan": 954 } },
  { teams: [["Jamie Taylor"], ["Sam Patel"]], score: [10, 5], verdict: [1, 0], newElos: { "Jamie Taylor": 1086, "Sam Patel": 1000 } },
  { teams: [["Alex Morgan", "Riley Jordan"], ["Casey Lee", "Morgan Reed"]], score: [5, 10], verdict: [0, 1], newElos: { "Alex Morgan": 1142, "Riley Jordan": 954, "Casey Lee": 1018, "Morgan Reed": 1000 } },
  { teams: [["Casey Lee"], ["Riley Jordan"]], score: [5, 0], verdict: [1, 0], newElos: { "Casey Lee": 1018, "Riley Jordan": 954 } },
  { teams: [["Alex Morgan", "Sam Patel"], ["Jamie Taylor", "Morgan Reed"]], score: [10, 5], verdict: [1, 0], newElos: { "Alex Morgan": 1142, "Sam Patel": 1000, "Jamie Taylor": 1086, "Morgan Reed": 1000 } },
  { teams: [["Sam Patel"], ["Casey Lee"]], score: [0, 5], verdict: [0, 1], newElos: { "Sam Patel": 1000, "Casey Lee": 1018 } },
].map((game, index) => ({
  ...game,
  creationDate: new Date(Date.now() - index * 86400000),
}));

for (const databaseName of ["felo", "felo_test"]) {
  const database = db.getSiblingDB(databaseName);
  database.users4.insertMany(demoUsers);
  database.games4.insertMany(demoGames);
}

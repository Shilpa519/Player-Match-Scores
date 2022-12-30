const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Hello, JHANISHILPAVAN!!!!  Server Started........");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};

initializeDBAndServer();

const convertPlayersToCamelCase = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
  };
};

const convertMatchDetailsToCamelCase = (details) => {
  return {
    matchId: details.match_id,
    match: details.match,
    year: details.year,
  };
};

const convertPlayerMatchDetailsToCamelCase = (details) => {
  return {
    matchId: details.match_id,
    match: details.match,
    year: details.year,
  };
};

const convertPlayerDetailsToCamelCase = (details) => {
  return {
    playerId: details.player_id,
    playerName: details.player_name,
  };
};

const convertPlayerStatsToCamelCase = (details) => {
  return {
    playerId: details.player_id,
    playerName: details.player_name,
    totalScore: details.score,
    totalFours: details.fours,
    totalSixes: details.sixes,
  };
};

//GET Players List
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM player_details;`;
  const playerArray = await db.all(getPlayers);
  response.send(playerArray.map((player) => convertPlayersToCamelCase(player)));
});

//GET Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertPlayersToCamelCase(player));
});

//UPDATE Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  console.log(playerName);
  const updatePlayerNameQuery = `UPDATE player_details SET player_name =
    '${playerName}' WHERE player_id = ${playerId}; `;
  const player = await db.get(updatePlayerNameQuery);
  response.send("Player Details Updated");
});

//GET Match Details
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `SELECT * FROM match_details WHERE match_id
    =${matchId}; `;
  const match = await db.get(getMatchDetailsQuery);
  response.send(convertMatchDetailsToCamelCase(match));
});

//GET Matches Played By Player
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesPlayedByPlayerQuery = `SELECT * FROM player_match_score 
    NATURAL JOIN match_details 
    WHERE player_id = ${playerId};`;
  const matchesDetailsArray = await db.all(getMatchesPlayedByPlayerQuery);
  response.send(
    matchesDetailsArray.map((eachItem) =>
      convertPlayerMatchDetailsToCamelCase(eachItem)
    )
  );
});

//GET Player Details From Specified Matches
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM player_match_score
    NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;
  const playerDetailsArray = await db.all(getPlayerDetailsQuery);
  console.log(playerDetailsArray);
  response.send(
    playerDetailsArray.map((eachItem) =>
      convertPlayerDetailsToCamelCase(eachItem)
    )
  );
});

//GET Player Stats
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStatsQuery = `SELECT player_match_details["SUM(score)"],SUM(fours),SUM(sixes), FROM player_match_score
  INNER JOIN player_details ON
  player_details.player_id = player_match_score.player_id
  WHERE player_details.player_id = ${playerId};`;
  const player = await db.get(getPlayerStatsQuery);
  console.log(player);
  response.send(convertPlayerStatsToCamelCase(player));
});

module.exports = app;

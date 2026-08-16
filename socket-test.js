const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:3000";

const PLAYER_1_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2Jvb25lZzAwMDF2ajVjZ2V1d3VpYXIiLCJpYXQiOjE3ODY2ODg4ODMsImV4cCI6MTc4NzI5MzY4M30.e4nnm7wPw_M5hvg2vsX4CiYNY3xB073sNhlI0QYlC1I";
const PLAYER_2_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2M3YTNlYzAwMDF2ajN3NGNxeGhoMG0iLCJpYXQiOjE3ODY2ODg5MDMsImV4cCI6MTc4NzI5MzcwM30.xb1nxn-NP8g_Hef6DJTMsajaVUswONIqPluaOELhTuU";

const MATCH_ID = "cmsvjwulq0001vjg4ogxfbauc";
// const LEAGUE_ID = "cmsk5s0of0000vjl0qqe4chvm";
// const OPPONENT_ID = "cmsc7a3ec0001vj3w4cqxhh0m";

const player1 = io(SERVER_URL, {
  auth: {
    token: PLAYER_1_TOKEN,
  },
});

const player2 = io(SERVER_URL, {
  auth: {
    token: PLAYER_2_TOKEN,
  },
});

player1.on("connect", () => {
  console.log("Player 1 connected:", player1.id);

  player1.emit("arena:join-match", MATCH_ID, (response) => {
    console.log("Player 1 join:", response);
  });
});

player2.on("connect", () => {
  console.log("Player 2 connected:", player2.id);

  player2.emit("arena:join-match", MATCH_ID, (response) => {
    console.log("Player 2 join:", response);
  });
});

player1.on("arena:question-started", (data) => {
  console.log("\nPLAYER 1 - QUESTION STARTED");
  console.dir(data, { depth: null });
});

player2.on("arena:question-started", (data) => {
  console.log("\nPLAYER 2 - QUESTION STARTED");
  console.dir(data, { depth: null });
});

player1.on("connect_error", (error) => {
  console.error("Player 1 connection error:", error.message);
});

player2.on("connect_error", (error) => {
  console.error("Player 2 connection error:", error.message);
});

player1.on("arena:answer-result", (data) => {
  console.log("\nPLAYER 1 - ANSWER RESULT");
  console.dir(data, { depth: null });
});

player2.on("arena:answer-result", (data) => {
  console.log("\nPLAYER 2 - ANSWER RESULT");
  console.dir(data, { depth: null });
});

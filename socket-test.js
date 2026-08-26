const { io } = require("socket.io-client");
const readline = require("readline");

const SERVER_URL = "http://localhost:3000";

const PLAYER_1_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2Jvb25lZzAwMDF2ajVjZ2V1d3VpYXIiLCJpYXQiOjE3ODcyOTU1MzQsImV4cCI6MTc4NzkwMDMzNH0.iERov4j30ot-rABeXqa2vdA5oCjkAyMVQ7kMsxFrbnk";

const PLAYER_2_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2M3YTNlYzAwMDF2ajN3NGNxeGhoMG0iLCJpYXQiOjE3ODcyOTU1ODQsImV4cCI6MTc4NzkwMDM4NH0.KQZQ7zwRWO_YDVrAWff2d6x4YcqGWv9mf6I-NFYtBL8";

const MATCH_ID = "cmt7oyakt000kvjxwd27ivt48";
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

// --------------------
// Player 1
// --------------------

player1.on("connect", () => {
  console.log("Player 1 connected:", player1.id);

  player1.emit("arena:join-match", MATCH_ID, (response) => {
    console.log("Player 1 join:", response);
  });
});

player1.on("disconnect", (reason) => {
  console.log("Player 1 disconnected:", reason);
});

player1.on("connect_error", (error) => {
  console.error("Player 1 connection error:", error.message);
});

player1.on("arena:question-started", (data) => {
  console.log("\nPLAYER 1 - QUESTION STARTED");
  console.dir(data, { depth: null });

  // ارسال پاسخ برای Player 1
  player1.emit(
    "arena:submit-answer",
    {
      matchId: MATCH_ID,
      matchQuestionId: data.matchQuestionId,
      selectedAnswer: 0,
    },
    (response) => {
      console.log("PLAYER 1 SUBMIT RESPONSE", response);
    },
  );
});

player1.on("arena:match-state", (state) => {
  console.log("\nPLAYER 1 - MATCH STATE");
  console.dir(state, { depth: null });
});

player1.on("arena:answer-result", (data) => {
  console.log("\nPLAYER 1 - ANSWER RESULT");
  console.dir(data, { depth: null });
});

// --------------------
// Player 2
// --------------------

player2.on("connect", () => {
  console.log("Player 2 connected:", player2.id);

  player2.emit("arena:join-match", MATCH_ID, (response) => {
    console.log("Player 2 join:", response);
  });
});

player2.on("disconnect", (reason) => {
  console.log("Player 2 disconnected:", reason);
});

player2.on("connect_error", (error) => {
  console.error("Player 2 connection error:", error.message);
});

player2.on("arena:question-started", (data) => {
  console.log("\nPLAYER 2 - QUESTION STARTED");
  console.dir(data, { depth: null });

  // ارسال پاسخ برای Player 2
  player2.emit(
    "arena:submit-answer",
    {
      matchId: MATCH_ID,
      matchQuestionId: data.matchQuestionId,
      selectedAnswer: 0,
    },
    (response) => {
      console.log("PLAYER 2 SUBMIT RESPONSE", response);
    },
  );
});

player2.on("arena:match-state", (state) => {
  console.log("\nPLAYER 2 - MATCH STATE");
  console.dir(state, { depth: null });
});

player2.on("arena:answer-result", (data) => {
  console.log("\nPLAYER 2 - ANSWER RESULT");
  console.dir(data, { depth: null });
});

// --------------------
// Terminal commands
// --------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`
Commands:

  1  -> Disconnect Player 1
  2  -> Disconnect Player 2
  r1 -> Reconnect Player 1
  r2 -> Reconnect Player 2
  s  -> Show socket status
  q  -> Exit
`);

rl.on("line", (input) => {
  const command = input.trim().toLowerCase();

  switch (command) {
    case "1":
      console.log("Disconnecting Player 1...");
      player1.disconnect();
      break;

    case "2":
      console.log("Disconnecting Player 2...");
      player2.disconnect();
      break;

    case "r1":
      console.log("Reconnecting Player 1...");
      player1.connect();
      break;

    case "r2":
      console.log("Reconnecting Player 2...");
      player2.connect();
      break;

    case "s":
      console.log("\nSOCKET STATUS");
      console.log(
        "Player 1:",
        player1.connected ? "CONNECTED" : "DISCONNECTED",
      );
      console.log(
        "Player 2:",
        player2.connected ? "CONNECTED" : "DISCONNECTED",
      );
      console.log();
      break;

    case "q":
      console.log("Closing socket test...");
      player1.disconnect();
      player2.disconnect();
      rl.close();
      process.exit(0);

    default:
      console.log("Unknown command");
  }
});

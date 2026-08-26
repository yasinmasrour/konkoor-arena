require("dotenv").config();

const http = require("http");
const app = require("./app");
const initializeSocket = require("./socket/socketServer");
const startArenaLeagueJob = require("./jobs/arenaLeagueJob");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = initializeSocket(server);

startArenaLeagueJob();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

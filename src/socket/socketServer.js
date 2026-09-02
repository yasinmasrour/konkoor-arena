const { Server } = require("socket.io");

const socketAuthMiddleware = require("./socketAuthMiddleware");
const arenaSocketService = require("./arenaSocketService");
const arenaMatchService = require("../services/arenaMatchService");
const arenaSocketStateService = require("./arenaSocketStateService");
const arenaSocketEvents = require("./arenaSocketEvents");
const arenaSocketConnectionState = require("./arenaSocketConnectionState");
const arenaGameEngine = require("../arena/arenaGameEngine");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  global.io = io;

  arenaSocketEvents.on("question-started", ({ matchId, question }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:question-started", question);
  });

  arenaSocketEvents.on("answer-result", ({ playerId, result }) => {
    const socketId = arenaSocketConnectionState.getPlayerSocket(playerId);

    if (!socketId) {
      console.log("ANSWER RESULT - PLAYER SOCKET NOT FOUND", {
        playerId,
      });

      return;
    }

    io.to(socketId).emit("arena:answer-result", result);
  });

  arenaSocketEvents.on("match-started", ({ matchId }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:match-started", {
      matchId,
    });
  });

  arenaSocketEvents.on("match-finished", ({ matchId, winnerId, rating }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:match-finished", {
      winnerId,
      rating,
    });
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

    arenaSocketConnectionState.addPlayerSocket(socket.user.id, socket.id);

    socket.on("arena:join-match", async (matchId, callback) => {
      try {
        const result = await arenaSocketService.joinMatchRoom(socket, matchId);

        arenaSocketConnectionState.addPlayerSocket(socket.user.id, socket.id);

        const state = await arenaSocketStateService.getMatchState(matchId);

        socket.emit("arena:match-state", state);

        callback?.({
          success: true,
          ...result,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    socket.on("arena:start-match", async (matchId, callback) => {
      try {
        const result = await arenaGameEngine.startMatch(
          matchId,
          socket.user.id,
        );

        callback?.({
          success: true,
          ...result,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    socket.on("arena:submit-answer", async (data, callback) => {
      try {
        const { matchId, matchQuestionId, selectedAnswer } = data;

        const result = await arenaGameEngine.submitAnswer({
          matchId,
          matchQuestionId,
          playerId: socket.user.id,
          selectedAnswer,
        });

        callback?.({
          success: true,
          result,
        });
      } catch (error) {
        console.error("Arena submit answer error:", error);

        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    socket.on("arena:leave-match", async (matchId, callback) => {
      try {
        const result = await arenaSocketService.leaveMatchRoom(socket, matchId);

        callback?.({
          success: true,
          ...result,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      arenaSocketConnectionState.removePlayerSocket(socket.user.id, socket.id);

      console.log(
        `Socket disconnected: ${socket.id} | User: ${socket.user.id}`,
      );
    });
  });

  return io;
};

module.exports = initializeSocket;

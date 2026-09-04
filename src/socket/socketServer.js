const { Server } = require("socket.io");

const socketAuthMiddleware = require("./socketAuthMiddleware");
const arenaSocketService = require("./arenaSocketService");
const arenaSocketStateService = require("./arenaSocketStateService");
const arenaSocketEvents = require("./arenaSocketEvents");
const arenaSocketConnectionState = require("./arenaSocketConnectionState");
const arenaGameEngine = require("../arena/arenaGameEngine");
const arenaSocketPresence = require("./arenaSocketPresence");
const { corsOrigins } = require("../config/env");
const arenaStickerService = require("./arenaStickerService");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: corsOrigins !== "*",
    },
  });

  global.io = io;

  arenaSocketEvents.on("question-started", ({ matchId, question }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:question-started", question);
  });

  arenaSocketEvents.on("answer-result", ({ playerId, result }) => {
    if (!arenaSocketService.emitToMatchPlayer(
      result.matchId,
      playerId,
      "arena:answer-result",
      result,
    )) {
      console.log("ANSWER RESULT - SOCKET SERVER NOT READY", {
        playerId,
        matchId: result.matchId,
      });
    }
  });

  arenaSocketEvents.on("match-started", ({ matchId }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:match-started", {
      matchId,
    });
  });

  arenaSocketEvents.on("match-finished", ({ matchId, winnerId, isDraw, rating }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:match-finished", {
      winnerId,
      isDraw,
      rating,
    });
  });

  arenaSocketEvents.on("match-state-changed", async ({ matchId }) => {
    try {
      const roomName = arenaSocketService.getArenaRoomName(matchId);
      const state = await arenaSocketStateService.getMatchState(matchId);
      io.to(roomName).emit("arena:match-state", state);
    } catch (error) {
      console.error("Arena match state broadcast error:", error);
    }
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);
    arenaSocketPresence.addSocket(socket.user.id, socket.id);

    socket.join(arenaSocketConnectionState.getPlayerRoomName(socket.user.id));

    socket.on("arena:join-match", async (matchId, callback) => {
      try {
        const result = await arenaSocketService.joinMatchRoom(socket, matchId);

        io.to(arenaSocketService.getArenaRoomName(matchId)).emit("arena:player-presence", {
          userId: socket.user.id,
          online: true,
        });

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

    socket.on("arena:send-sticker", async (data, callback) => {
      try {
        const { matchId, stickerId } = data ?? {};
        const result = await arenaStickerService.sendSticker({
          socket,
          matchId,
          stickerId,
        });

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

    socket.on("arena:network-ping", (data, callback) => {
      callback?.({
        success: true,
        serverTime: Date.now(),
      });
    });

    socket.on("arena:network-quality", (data, callback) => {
      try {
        const { matchId, latencyMs } = data ?? {};
        const parsedLatency = Number(latencyMs);

        if (!matchId || !Number.isFinite(parsedLatency) || parsedLatency < 0 || parsedLatency > 10000) {
          callback?.({ success: false, message: "Invalid network quality data." });
          return;
        }

        if (!arenaSocketPresence.isUserInMatch(socket.user.id, matchId)) {
          callback?.({ success: false, message: "You are not connected to this match." });
          return;
        }

        const quality = require("./socketNetworkQuality").buildNetworkQuality(parsedLatency);
        const roomName = arenaSocketService.getArenaRoomName(matchId);

        io.to(roomName).emit("arena:network-quality", {
          userId: socket.user.id,
          ...quality,
        });

        callback?.({ success: true });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("arena:leave-match", async (matchId, callback) => {
      try {
        const result = await arenaSocketService.leaveMatchRoom(socket, matchId);

        if (!arenaSocketPresence.isUserInMatch(socket.user.id, matchId)) {
          io.to(arenaSocketService.getArenaRoomName(matchId)).emit("arena:player-presence", {
            userId: socket.user.id,
            online: false,
          });
        }

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
      arenaStickerService.cleanupSocket(socket.id);
      const matchIds = arenaSocketPresence.removeSocketCompletely(
        socket.user.id,
        socket.id,
      );

      for (const matchId of matchIds) {
        if (!arenaSocketPresence.isUserInMatch(socket.user.id, matchId)) {
          io.to(arenaSocketService.getArenaRoomName(matchId)).emit("arena:player-presence", {
            userId: socket.user.id,
            online: false,
          });
        }
      }

      console.log(
        `Socket disconnected: ${socket.id} | User: ${socket.user.id}`,
      );
    });
  });

  return io;
};

module.exports = initializeSocket;

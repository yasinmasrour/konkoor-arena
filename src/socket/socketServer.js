const { Server } = require("socket.io");

const socketAuthMiddleware = require("./socketAuthMiddleware");
const arenaSocketService = require("./arenaSocketService");
const arenaSocketStateService = require("./arenaSocketStateService");
const arenaSocketEvents = require("./arenaSocketEvents");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  arenaSocketEvents.on("question-started", ({ matchId, question }) => {
    const roomName = arenaSocketService.getArenaRoomName(matchId);

    io.to(roomName).emit("arena:question-started", question);
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

    socket.on("arena:join-match", async (matchId, callback) => {
      try {
        const result = await arenaSocketService.joinMatchRoom(socket, matchId);

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
      console.log(
        `Socket disconnected: ${socket.id} | User: ${socket.user.id}`,
      );
    });
  });

  return io;
};

module.exports = initializeSocket;

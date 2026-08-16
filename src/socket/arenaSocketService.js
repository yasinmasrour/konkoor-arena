const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getArenaRoomName = (matchId) => {
  return `arena:match:${matchId}`;
};

const joinMatchRoom = async (socket, matchId) => {
  const player = await prisma.arenaMatchPlayer.findUnique({
    where: {
      matchId_userId: {
        matchId,
        userId: socket.user.id,
      },
    },

    include: {
      match: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!player) {
    throw new AppError("You are not a player in this match", 403);
  }

  const roomName = getArenaRoomName(matchId);

  await socket.join(roomName);

  return {
    roomName,
    matchId,
    playerId: player.userId,
    matchStatus: player.match.status,
  };
};

const leaveMatchRoom = async (socket, matchId) => {
  const roomName = getArenaRoomName(matchId);

  await socket.leave(roomName);

  return {
    roomName,
    matchId,
  };
};

module.exports = {
  getArenaRoomName,
  joinMatchRoom,
  leaveMatchRoom,
};

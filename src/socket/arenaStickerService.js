const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaSocketPresence = require("./arenaSocketPresence");
const arenaSocketService = require("./arenaSocketService");
const { getArenaSticker } = require("../constants/arenaStickers");

const WINDOW_MS = 10_000;
const MAX_STICKERS_PER_WINDOW = 10;
const MIN_INTERVAL_MS = 900;
const socketStickerHistory = new Map();

const cleanupSocket = (socketId) => {
  socketStickerHistory.delete(socketId);
};

const checkRateLimit = (socketId) => {
  const now = Date.now();
  const history = socketStickerHistory.get(socketId) ?? [];
  const recent = history.filter((timestamp) => now - timestamp < WINDOW_MS);

  const lastSentAt = recent.at(-1) ?? 0;
  if (lastSentAt && now - lastSentAt < MIN_INTERVAL_MS) {
    throw new AppError("Please wait before sending another sticker.", 429);
  }

  if (recent.length >= MAX_STICKERS_PER_WINDOW) {
    throw new AppError("Sticker rate limit exceeded. Please wait a moment.", 429);
  }

  recent.push(now);
  socketStickerHistory.set(socketId, recent);
};

const sendSticker = async ({ socket, matchId, stickerId }) => {
  if (!matchId || typeof stickerId !== "string") {
    throw new AppError("Invalid sticker payload.", 400);
  }

  const sticker = getArenaSticker(stickerId);
  if (!sticker) {
    throw new AppError("Sticker is not available.", 400);
  }

  if (!arenaSocketPresence.isUserInMatch(socket.user.id, matchId)) {
    throw new AppError("You are not connected to this match.", 403);
  }

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
    throw new AppError("You are not a player in this match.", 403);
  }

  if (player.match.status !== "playing") {
    throw new AppError("Stickers can only be sent during an active match.", 409);
  }

  checkRateLimit(socket.id);

  const io = global.io;
  if (!io) {
    throw new AppError("Arena socket server is not ready.", 503);
  }

  io.to(arenaSocketService.getArenaRoomName(matchId)).emit("arena:sticker", {
    matchId,
    stickerId: sticker.id,
    asset: sticker.asset,
    senderId: socket.user.id,
    senderName: `${socket.user.firstName ?? ""} ${socket.user.lastName ?? ""}`.trim() || "بازیکن",
    sentAt: new Date().toISOString(),
  });

  return { stickerId: sticker.id };
};

module.exports = {
  sendSticker,
  cleanupSocket,
};

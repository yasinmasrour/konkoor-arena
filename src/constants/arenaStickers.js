const ARENA_STICKERS = Object.freeze([
  { id: "sticker-01", label: "Sticker 01", asset: "/stickers/arena/sticker-01.webp" },
  { id: "sticker-02", label: "Sticker 02", asset: "/stickers/arena/sticker-02.webp" },
  { id: "sticker-03", label: "Sticker 03", asset: "/stickers/arena/sticker-03.webp" },
  { id: "sticker-04", label: "Sticker 04", asset: "/stickers/arena/sticker-04.webp" },
  { id: "sticker-05", label: "Sticker 05", asset: "/stickers/arena/sticker-05.webp" },
  { id: "sticker-06", label: "Sticker 06", asset: "/stickers/arena/sticker-06.webp" },
  { id: "sticker-07", label: "Sticker 07", asset: "/stickers/arena/sticker-07.webp" },
  { id: "sticker-08", label: "Sticker 08", asset: "/stickers/arena/sticker-08.webp" },
]);

const ARENA_STICKER_BY_ID = new Map(ARENA_STICKERS.map((sticker) => [sticker.id, sticker]));

const getArenaSticker = (stickerId) => ARENA_STICKER_BY_ID.get(stickerId) ?? null;

module.exports = {
  ARENA_STICKERS,
  getArenaSticker,
};

const SOLO_LEVELS = Object.freeze({
  easy: {
    key: "easy",
    label: "آسان",
    timeLimit: 60, // ثانیه
  },
  medium: {
    key: "medium",
    label: "متوسط",
    timeLimit: 45,
  },
  hard: {
    key: "hard",
    label: "سخت",
    timeLimit: 30,
  },
});

const SOLO_STATUS = Object.freeze({
  PLAYING: "playing",
  WON: "won",
  LOST: "lost",
  ABANDONED: "abandoned",
});

const SOLO_CONFIG = Object.freeze({
  TOTAL_QUESTIONS: 5, // ۵ سوال
  TOTAL_LIVES: 3, // ۳ جان
});

module.exports = {
  SOLO_LEVELS,
  SOLO_STATUS,
  SOLO_CONFIG,
};

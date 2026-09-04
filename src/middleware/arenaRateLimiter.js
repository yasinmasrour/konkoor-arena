const rateLimit = require("express-rate-limit");

// Matchmaking is an expensive state-changing operation, so keep it tighter
// than the general authentication/API limits.
const arenaQueueLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many matchmaking requests, please try again shortly",
  },
});

module.exports = {
  arenaQueueLimiter,
};

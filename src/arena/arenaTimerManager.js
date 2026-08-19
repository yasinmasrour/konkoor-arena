const timers = new Map();

const getTimerKey = (matchId, matchQuestionId) => {
  return `${matchId}:${matchQuestionId}`;
};

const startQuestionTimer = ({
  matchId,
  matchQuestionId,
  timeLimit,
  onTimeout,
}) => {
  const key = getTimerKey(matchId, matchQuestionId);

  cancelQuestionTimer(matchId, matchQuestionId);

  const timer = setTimeout(async () => {
    timers.delete(key);

    try {
      await onTimeout();
    } catch (error) {
      console.error(`Arena question timeout failed: ${matchQuestionId}`, error);
    }
  }, timeLimit * 1000);

  timers.set(key, timer);
};

const cancelQuestionTimer = (matchId, matchQuestionId) => {
  const key = getTimerKey(matchId, matchQuestionId);

  const timer = timers.get(key);

  if (!timer) {
    return;
  }

  clearTimeout(timer);

  timers.delete(key);
};

const cancelMatchTimers = (matchId) => {
  for (const [key, timer] of timers.entries()) {
    if (key.startsWith(`${matchId}:`)) {
      clearTimeout(timer);
      timers.delete(key);
    }
  }
};

module.exports = {
  startQuestionTimer,
  cancelQuestionTimer,
  cancelMatchTimers,
};

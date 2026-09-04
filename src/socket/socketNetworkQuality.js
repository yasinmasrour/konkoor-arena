const classifyLatency = (latencyMs) => {
  if (latencyMs <= 80) return "good";
  if (latencyMs <= 180) return "fair";
  return "poor";
};

const buildNetworkQuality = (latencyMs) => ({
  latencyMs,
  quality: classifyLatency(latencyMs),
  measuredAt: new Date().toISOString(),
});

module.exports = {
  classifyLatency,
  buildNetworkQuality,
};

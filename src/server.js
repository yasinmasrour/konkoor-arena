const http = require("http");
const app = require("./app");
const initializeSocket = require("./socket/socketServer");
const startArenaLeagueJob = require("./jobs/arenaLeagueJob");
const prisma = require("./config/prisma");
const { port, isProduction } = require("./config/env");

const PORT = port;
const server = http.createServer(app);
const io = initializeSocket(server);
const arenaLeagueJob = startArenaLeagueJob();

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown...`);
  arenaLeagueJob?.stop();

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);
  forceShutdownTimer.unref();

  try {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    await new Promise((resolve) => io.close(resolve));
    await prisma.$disconnect();

    clearTimeout(forceShutdownTimer);
    console.log("Graceful shutdown completed.");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimer);
    console.error("Graceful shutdown failed:", error.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  if (isProduction) shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

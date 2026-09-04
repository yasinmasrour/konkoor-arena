# v34 — Production Readiness

Production preparation includes:
- `/health/live` liveness endpoint.
- `/health/ready` readiness endpoint with PostgreSQL connectivity check.
- Production-aware HTTP access logging.
- Graceful shutdown for HTTP server, Socket.IO, cron job, and Prisma.
- Shutdown timeout to avoid hanging processes.
- Production handling for unhandled rejections and uncaught exceptions.

Test locally:
- `GET /health/live` -> 200.
- `GET /health/ready` -> 200 when DB is reachable; 503 otherwise.
- Start server, then stop it with Ctrl+C and verify graceful shutdown logs.
- Verify Arena sockets and scheduled job still work after restart.

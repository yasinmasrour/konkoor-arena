# Konkoor Arena — v30 Security Hardening

## What changed
- Added centralized environment configuration with production JWT secret validation.
- Added global HTTP API rate limiting (300 requests / 15 minutes).
- Added stricter authentication rate limiting (10 failed register/login attempts / 15 minutes).
- Added Zod validation for login requests and normalized authentication emails.
- Restricted HTTP CORS to configured origins instead of allowing every origin by default when configured.
- Restricted Socket.IO CORS using the same origin configuration.
- Hardened Bearer authorization header parsing.
- Added safe JWT error mapping: expired/invalid tokens no longer leak library errors.
- Restored generic 500 responses for unexpected errors so internal messages are not exposed.
- Removed the hard-coded admin seed password; seed credentials now come from environment variables.
- Added `.env.example` documenting required production/development variables.
- Added Prisma P2034 conflict mapping to a safe 409 response.

## Environment
Copy `.env.example` to `.env` and set real values.

For production:
- Set `NODE_ENV=production`.
- Set a random `JWT_SECRET` with at least 32 characters.
- Set `CORS_ORIGINS` to the exact frontend origin(s), comma-separated if needed.
- Set strong `SEED_ADMIN_*` values only when seeding is actually required.

## Test checklist
1. `node --check src/config/env.js`
2. `node --check src/middleware/errorHandler.js`
3. `node --check src/middleware/authMiddleware.js`
4. `node --check src/services/authService.js`
5. `node --check src/socket/socketAuthMiddleware.js`
6. `node --check src/socket/socketServer.js`
7. `node --check prisma/seed.js`
8. Start the backend and verify login/register.
9. Verify invalid/expired JWT returns 401 without internal error details.
10. Verify a malformed Authorization header returns 401.
11. Verify requests from an unconfigured CORS origin are rejected.
12. Verify repeated failed login/register attempts trigger the auth limiter.
13. Verify normal authenticated Arena HTTP and Socket.IO flows still work.
14. If using the seed script, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` first.

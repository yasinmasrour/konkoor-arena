# v35 — Production Deployment + Smoke Test

Adds a repeatable production deployment baseline without changing application business logic:
- Backend production Docker image.
- Frontend production Docker image with Nginx SPA fallback.
- Production docker-compose configuration.
- Automated HTTP smoke test for liveness, readiness, root and Swagger.
- `npm run smoke:production` script.

## Local smoke test
Start the backend, then run:

```bash
npm run smoke:production
```

For another base URL:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke:production
```

## Docker
Create a production `.env` containing at minimum `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, and other existing required variables. Also set `VITE_API_URL` to the public backend URL used by the browser.

```bash
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

Then verify:

```bash
npm run smoke:production
```

The frontend is served on port 8080 and the backend on port 3000 by default. Put TLS/reverse-proxy/CDN in front of these services for an internet-facing deployment.

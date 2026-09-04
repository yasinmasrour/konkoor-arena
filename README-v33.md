# v33 — Admin Panel Foundation

Adds a protected ADMIN-only frontend panel at `/admin` with live counts for exams, booklets, and questions. Adds a role-aware route guard and a 403 page. Backend authorization remains authoritative.

## Test

Frontend:
```bash
cd frontend
npm run build
npm run lint
```

Login as an ADMIN and open `/admin`. Verify a STUDENT is redirected to `/403`, while unauthenticated users are redirected to login.

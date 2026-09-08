# V59 — Booklet Management Core

## Scope
Backend core for managing exam booklets before the Builder UI.

### Added
- Booklet title field.
- Role-scoped booklet access for ADMIN and COUNSELOR.
- Draft/review/published/archived lifecycle.
- Safe status transitions.
- Published-question-only validation.
- Add/remove/reorder booklet questions.
- Duplicate booklet as draft.
- Delete protection for booklets already used by exams.
- Published booklet edit/delete protection.
- Pagination, search, filters, sorting.

### Endpoints
- POST /booklets
- GET /booklets
- GET /booklets/:id
- PATCH /booklets/:id
- PATCH /booklets/:id/status
- POST /booklets/:id/questions
- DELETE /booklets/:id/questions/:questionId
- PUT /booklets/:id/questions/reorder
- POST /booklets/:id/duplicate
- DELETE /booklets/:id

## Migration
`20260907130000_booklet_management_core`

Run:
`npx prisma migrate deploy`
`npx prisma generate`

## Note
No frontend changes are included in V59. Builder UI is planned for the next step after this backend is tested.

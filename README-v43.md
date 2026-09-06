# Konkoor Arena — V43 Question Designer Core

V43 introduces the backend foundation for a dedicated Question Designer workflow.

## Question lifecycle

```text
Draft → Review → Published
  │       │          │
  └───────┴──────────┴→ Archived
```

- New questions are created as `draft`.
- A question designer can submit their own draft for review.
- Only an admin can approve/publish, return to draft, or archive a question.
- Question designers cannot edit published questions.
- Used questions cannot be deleted; they must be archived.

## Question management improvements

- Question designers only see questions they created.
- Search now covers question text, code, and topic.
- Filtering supports lesson, grade, major, chapter, difficulty, status, and creator.
- Sorting supports creation/update time, code, lesson, grade, chapter, difficulty, status, and usage count.
- Question ownership is checked server-side.
- Status transitions are validated server-side.
- Existing Admin/Counselor question access is preserved where appropriate.

## New endpoints

- `POST /questions/:id/submit-review`
- `PATCH /questions/:id/status`

The existing question CRUD endpoints remain available.

## Database

No Prisma migration is required for V43 because the existing `Question.status`, `createdById`, and `usageCount` fields already support this workflow.

## Verification

Backend JavaScript files changed in V43 pass `node --check` syntax validation.

# V58 — Question Review Workflow

V58 adds the backend core for the question review workflow without changing the existing Question Bank flow.

## Workflow

`draft → review → published`

A reviewer can also return a question to `draft` with a required note, or archive it.

## New API

All review endpoints require authentication and `ADMIN` role.

- `GET /questions/review` — review queue, with pagination and optional search/filter query parameters.
- `GET /questions/review/:id` — full question plus review history.
- `POST /questions/review/:id/decision` — apply one review decision.

Decision body:

```json
{
  "decision": "approved | changes_requested | archived",
  "note": "optional, required for changes_requested"
}
```

`approved` publishes the question, `changes_requested` returns it to draft, and `archived` archives it.

Review decisions and reviewer information are stored in `QuestionReview` as an audit history.

## Database

Migration:

`20260907100000_add_question_review_workflow`

The migration adds the `QuestionReview` table and its indexes/foreign keys.

## Validation

- Only questions currently in `review` can receive a review decision.
- Only admins can access the review queue or apply decisions.
- A note is mandatory when requesting changes.
- The decision and status update happen atomically in one Prisma transaction.

## Next step

V58 backend should be tested before adding the Review Panel UI. The next frontend stage will provide the admin review queue, question preview, decision controls, review notes, and navigation between pending questions.

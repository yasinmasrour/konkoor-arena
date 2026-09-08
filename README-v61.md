# konkoor-arena — V61 Exam Builder

Based on v60.1-fixed2.

## V61 scope
- Added Exam Builder frontend at `/exam-builder` and `/exam-builder/new` / `/exam-builder/:id`.
- Added frontend Exam API for exam CRUD and Exam ↔ Booklet relation operations.
- Added Booklet Picker using published booklets only.
- Added pending booklet selection before first exam save.
- Added booklet removal and drag/drop ordering.
- Added exam preview and status controls.
- Completed backend service implementations for:
  - POST /exams/:id/booklets
  - DELETE /exams/:id/booklets/:bookletId
  - PATCH /exams/:id/booklets/order
- Added owner scoping for counselor exam read/update/delete paths.
- Published exams are locked against editing/relation changes/deletion.

## Important note
Exam duration is currently derived in the UI from the sum of selected booklet durations. The database `Exam` model has not been changed to add a separate duration field in this version.

## Deferred
- Dedicated exam duplication endpoint/UI.
- Full real review workflow with reviewer/decision history.
- Question/booklet snapshot/versioning before production Exam execution.
- Exam-specific settings beyond the current schema.

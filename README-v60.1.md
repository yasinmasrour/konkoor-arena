# Griffin Academy / konkoor-arena — V60.1

## Booklet Builder Core Fix

V60.1 is a focused stabilization release based on V60 fixed. No redesign of the tested Booklet Management backend was made.

### Fixed
- `/booklet-builder/new` now opens the actual new-booklet builder instead of the booklet list.
- `/booklet-builder` remains the booklet list route.
- Metadata validation now displays the validation error instead of silently returning.
- Question Picker no longer applies hidden lesson/grade/major filters from booklet defaults; it shows all published questions and lets search narrow the result.
- Selected questions in a new booklet are visible before the first save and can be removed.
- Pending question selections preserve their order when the booklet is created.
- API error responses now surface backend `message`/`errors` when available instead of replacing every failure with a generic message.
- Picker selection is reset after successful addition.

### Intentionally deferred
- Real Booklet Review entity/history/approval workflow.
- Enforcing Admin-only publication if review is required by product rules.
- Question snapshots/versioning for published booklets/exams.
- Published-booklet locking/version semantics.
- Question `usageCount` semantics and updates.
- Component decomposition/refactor.

### Validation
- Backend JavaScript syntax should be checked with `node --check` across `backend/src`.
- Frontend build requires a complete `node_modules` installation; the source package itself does not include installed dependencies.

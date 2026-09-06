# V52 — Question Bank Bulk Management

Based on V51-fixed.

## Changes
- Added bulk question status endpoint: `PATCH /questions/bulk-status`.
- Admin can bulk publish, archive, or return selected questions to draft.
- Bulk endpoint validates all IDs exist and validates every status transition before updating.
- Question Bank now supports selecting individual questions and selecting all questions on the current page.
- Added bulk action toolbar with selected count and cancel selection.
- Preserved V51 duplicate-question flow and review-submit reliability fix.
- No AI features added to Question Designer/Question Bank.
- No Prisma migration required.

## Notes
Bulk selection is page-scoped. Bulk status changes are admin-only and intentionally atomic at the validation level: if any selected question has an invalid transition, no update is performed.

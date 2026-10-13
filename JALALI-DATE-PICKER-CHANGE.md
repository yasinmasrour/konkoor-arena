# Jalali Date Picker Change

This archive contains the current project with only the date-selection UI changed.

## What changed
- Added `frontend/src/components/ui/JalaliDatePicker.tsx`, a reusable Persian-calendar date picker styled for Griffin Academy and light/dark themes.
- Replaced the six native Gregorian date inputs in profile completion, profile editing, subscription-plan discount expiry, and counselor study-plan editing.
- The picker displays Persian calendar dates but emits the selected date as a Gregorian `YYYY-MM-DD` string so existing API and database expectations remain unchanged.
- No backend, database schema, payment, authentication, or deployment configuration was intentionally changed.

## Important
For safety, the archive intentionally omits these environment files if present: `.env`, `frontend/.env.production`. Keep your existing private copies; do not commit them to Git or share them publicly. The `.env.example` templates are retained.

## Validation
The calendar conversion logic was checked against known Persian-calendar dates. A full frontend build could not be run in this environment because project dependencies are not installed locally and the package registry request timed out. Run `npm ci` in `frontend/`, then `npm run build`, before deploying.

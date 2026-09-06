# V53 — Question Bank Quick Edit

Based on V52 bulk question management.

## Added
- Quick Edit action directly from Question Bank.
- Modal editing for lesson, grade, major, chapter, topic, difficulty, year, and tags.
- Keeps question code, text, image, options, correct answer, and explanation unchanged.
- Uses the existing authenticated `PATCH /questions/:id` endpoint; no database migration.
- Designer cannot quick-edit published questions; admin can edit them subject to backend authorization.
- Updates the edited row in place without a full page reload.
- Light/dark theme support preserved.

## AI
Question Designer remains fully AI-free. Existing exam AI Analysis is unchanged.

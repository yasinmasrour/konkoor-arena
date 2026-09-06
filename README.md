# Konkoor Arena — v31 Exam Flow Hardening + DB Integrity

## What changed
- Exam attempts now capture immutable question snapshots at start time: text, image, options, correct answer, explanation, difficulty, lesson, chapter, and booklet score.
- Attempt answers are now the authoritative question set for an attempt, preventing later exam/booklet edits from changing the questions shown to a student.
- Answer correctness is calculated from the captured correct-answer snapshot instead of the current Question record.
- Answer option range is validated against the captured options.
- Starting an exam rejects empty exams, duplicate questions, questions with fewer than two options, and invalid correct-answer indexes.
- Attempt submission is transactional and uses an atomic started→submitted update to prevent concurrent double submission.
- Attempt review is available only after submission.
- Added indexes supporting attempt status/history and answer lookups.
- Existing rows remain compatible through nullable snapshot fields/defaults; new attempts populate all snapshot fields.

## Required DB update
Run:

`npx prisma db push`

(or apply the equivalent migration in a production migration workflow).

## Test checklist
1. Run `node --check src/services/attemptService.js`.
2. Run `npx prisma validate`.
3. Apply the schema with `npx prisma db push` in development.
4. Start a new published exam attempt and confirm all questions load normally.
5. Change a Question's text/options/correctAnswer after the attempt starts; the active attempt must continue using its captured snapshot.
6. Submit answers, including an out-of-range answer, and confirm invalid indexes are rejected.
7. Submit the same attempt twice and confirm the second submission is rejected.
8. Try starting the same exam twice for one student; only one attempt may exist.
9. Confirm review is blocked before submission and works after submission.
10. Confirm existing Arena flows remain unaffected.


## V43 — Question Designer Core

The project now includes the backend foundation for a dedicated Question Designer workflow.

- Question lifecycle: `draft`, `review`, `published`, `archived`
- Server-side ownership checks for question designers
- Designer-only question-bank visibility
- Search across question text, code, and topic
- Filters for lesson, grade, major, chapter, difficulty, status, and creator
- Extended sorting options
- Draft submission for review
- Admin-controlled status transitions
- Used questions are protected from deletion and should be archived instead

See `README-v43.md` for the V43 details.

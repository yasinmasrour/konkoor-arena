# V55 — Question Import (CSV / Excel)

V55 adds a safe bulk-import workflow for the Question Bank.

## Flow

CSV/XLSX/XLS → Upload → Preview → Server-side validation → Import as Draft

Preview never writes questions to the database.

## Supported files

- `.csv`
- `.xlsx`
- `.xls`
- Maximum size: 5 MB
- Maximum data rows: 500

## Required columns

`code, lesson, grade, major, chapter, questionText, option1, option2, option3, option4, correctAnswer`

Optional columns:

`questionImage, topic, explanation, explanationPdf, source, author, year, difficulty, tags`

`correctAnswer` is **1-based** in the import file: 1, 2, 3, or 4. The backend converts it to the existing 0-based database representation.

`tags` is comma-separated.

## Validation

- Duplicate code already in the database → error
- Duplicate code inside the uploaded file → error
- Missing/invalid required data → error
- Invalid grade/major/difficulty → error
- Invalid correct answer → error
- Missing explanation/source/author → warning
- Invalid image path/URL → warning

Any error blocks the import. Warnings do not block the import.

All imported questions are created with:

- `status = draft`
- `usageCount = 0`
- `createdById = authenticated user`

The server re-parses and re-validates the file during the actual import; the frontend preview is never treated as authoritative.

## Frontend

New page: `/question-import`

The Question Bank now has an **ورود گروهی** action.

## No AI

This feature does not use AI and adds no AI API calls or tokens.

## Dependencies

Backend requires:

```bash
npm install multer xlsx
```

After installation:

```bash
npx prisma generate
npm run start
```

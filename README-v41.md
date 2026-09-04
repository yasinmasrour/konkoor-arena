# v41-A — AI Analysis Core

This version adds the backend core for AI-powered analysis of submitted exam attempts.

## What was added

- Official OpenAI JavaScript SDK dependency (`openai`).
- Backend-only OpenAI configuration through `OPENAI_API_KEY` and `OPENAI_MODEL`.
- `AIAnalysis` Prisma model with one saved AI analysis per submitted attempt.
- Structured AI output using the Responses API JSON Schema format.
- Student-only endpoints:
  - `POST /attempts/:id/ai-analysis`
  - `GET /attempts/:id/ai-analysis`
- Authorization: a student can access only their own submitted attempt.
- Dedicated AI analysis rate limit: 5 requests per 15 minutes.
- Existing deterministic exam scoring remains authoritative; AI does not calculate or modify the official score.

## Important setup

From the backend root:

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

Add these to the backend `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

**Never put `OPENAI_API_KEY` in `frontend/.env` or client-side code.**

## Test order

1. Confirm the backend starts without syntax errors.
2. Log in as a student.
3. Submit an exam attempt.
4. Call `POST /attempts/:id/ai-analysis` with the submitted attempt ID.
5. Confirm a structured Persian analysis is returned.
6. Call the same POST endpoint again and confirm the saved result is returned without generating a second analysis.
7. Call `GET /attempts/:id/ai-analysis` and confirm the saved analysis is returned.
8. Test another student's attempt ID and confirm `403 Forbidden`.
9. Test an unsubmitted attempt and confirm `400`.
10. Test the endpoint without `OPENAI_API_KEY` and confirm `503` rather than a server crash.

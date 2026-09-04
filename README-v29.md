# konkoor-arena — v29 Database & Transaction Integrity

## Changes

- Made Arena match creation fully atomic under the existing Serializable transaction wrapper.
- Moved league/user validation, active-match detection, question selection, rating creation, and match creation into one transaction.
- Added `ensurePlayerRatingsTx()` so rating upserts participate in the same transaction instead of opening a separate transaction.
- Added a database-level unique constraint on `ArenaRatingHistory(matchId, userId)` to prevent duplicate rating-history rows for the same player and match.

## Why

The previous match-creation flow checked for active matches before the final `create()`. Two simultaneous requests could both pass the check and create competing active matches. The v29 flow closes that race with Serializable transactions and retry handling already present in `runArenaTransaction()`.

The rating-history uniqueness constraint adds a second database-level safeguard alongside the `ArenaMatch.ratingUpdated` gate.

## Database update

After replacing the project files, run:

```bash
npx prisma db push
```

If the command reports existing duplicate rows for `(matchId, userId)` in `ArenaRatingHistory`, those duplicates must be cleaned before the unique constraint can be applied.

## Validation performed

- `node --check src/services/arenaMatchService.js`
- `node --check src/services/arenaRatingService.js`

A live Prisma validation was not run in the build environment because dependency/network execution was unavailable.

## Regression focus

After `prisma db push`, test:

1. Normal matchmaking and match creation.
2. Two simultaneous matchmaking attempts involving the same player: only one active match must be created.
3. Normal match completion and rating update.
4. Rating history contains exactly two rows per finished match.
5. Repeated finish/rating-update calls do not change ratings or create additional history rows.
6. Existing Arena answer/timeout/reconnect behavior remains unchanged.

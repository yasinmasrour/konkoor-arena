# V64 — Arena Matchmaking Stable

V64 rebuilds the Arena matchmaking lifecycle on top of the completed V63 baseline.

## Fixes

- Stale queue cleanup now runs before an existing queue entry can block a player.
- Joining an already-active queue is idempotent instead of returning a misleading 400 error.
- Matchmaking decisions are serialized per league with a PostgreSQL transaction-scoped advisory lock.
- Queue claiming and match creation happen in the same serializable transaction.
- If match creation fails, the queue claim rolls back atomically; a successful player's queue cannot be reset accidentally by a competing request.
- Match creation reuses the transaction-safe `createArenaMatchTx` implementation.
- Queue status is checked when the Matchmaking page opens, so refresh/re-entry preserves the real server state.
- Queue elapsed time is restored from the server's `joinedAt` timestamp.
- Leave queue is idempotent and no longer treats an already-cancelled/completed row as a fatal client error.
- Frontend now displays the backend's actual error message instead of the generic Axios error text.
- Existing Socket.IO `arena:match-found` flow remains the authoritative transition into a match.

## No schema migration required

V64 uses PostgreSQL transaction-scoped advisory locks and the existing `ArenaQueue` schema. No new Prisma model or column is required.

## Validation checklist

1. Run `node --check src/services/arenaMatchService.js`.
2. Run `node --check src/services/arenaMatchmakingService.js`.
3. Run `node --check src/controllers/arenaQueueController.js`.
4. Run `node --check src/routes/arenaQueueRoutes.js`.
5. Run `npx prisma validate`.
6. Log in as two different users in separate browser profiles and enter the same active league.
7. Confirm the first user waits and the second user creates exactly one match with the first.
8. Refresh a player while waiting and confirm the page remains in the queue.
9. Click Join repeatedly while waiting and confirm no duplicate queue row and no 400.
10. Cancel the queue and confirm the player can immediately join again.
11. Simulate an old queue row and confirm the next Join is not blocked by it.
12. Run concurrent joins and confirm one match is created, not two.
13. Confirm Arena Match, answer submission, result, rating and history flows remain unchanged.

## Baseline

V63 Stable is preserved as the baseline for the Exam Builder and all completed non-Arena features. V64 changes only the Arena matchmaking lifecycle plus the small frontend state/error handling needed to consume it safely.

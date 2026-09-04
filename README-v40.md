# v40 — Arena Stickers

Adds real-time custom sticker reactions to active Arena matches.

## Backend

- `src/constants/arenaStickers.js`: allowlisted sticker catalog.
- `src/socket/arenaStickerService.js`: authorization, active-match check, allowlist validation and rate limiting.
- Socket event `arena:send-sticker` accepts `{ matchId, stickerId }`.
- Socket event `arena:sticker` broadcasts the validated sticker to the Arena room.
- No database table is required; stickers are ephemeral match events.
- Sticker sending requires the authenticated user to be a player in the match and the match status to be `playing`.
- Rate limit: minimum 900ms between stickers and maximum 10 stickers per 10 seconds per socket.

## Frontend

- `ArenaStickerPanel` provides the sticker picker.
- `ArenaStickerOverlay` displays the sent sticker briefly.
- Custom assets belong in `frontend/public/stickers/arena/`.
- Replace the eight placeholder filenames with the user's custom artwork using the exact filenames listed in that folder's README.

## Important

Sticker IDs and asset paths are intentionally centralized and allowlisted. Do not accept arbitrary client-provided image URLs.


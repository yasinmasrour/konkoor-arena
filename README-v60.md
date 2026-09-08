# V60 — Booklet Builder UI

This version adds the frontend Booklet Builder on top of the V59 Booklet Management Core.

## Added
- Booklet list at `/booklets` for ADMIN and COUNSELOR
- New/edit Booklet Builder at `/booklet-builder/new` and `/booklet-builder/:id`
- Booklet metadata form: title, lesson, grade, major, date/time, duration
- Published-question picker with search, pagination, and current booklet filtering
- Add/remove questions
- Native drag & drop question reordering
- Booklet preview with question/options rendering and MathText support
- Draft → Review and Review → Published controls supported by the existing backend lifecycle
- Duplicate action
- Navbar link for ADMIN and COUNSELOR

## Notes
- No new dependency was added.
- Drag & drop uses native browser APIs.
- Only published questions are requested from the Question Bank for selection.
- Existing V59 backend endpoints are reused without changing their core behavior.

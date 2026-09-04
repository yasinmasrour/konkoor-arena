# Konkoor Arena — v39 Payment Core

Based on the confirmed v38 build.

## Added
- `Payment` Prisma model with amount snapshot, status, gateway, merchant order ID, authority, transaction ID, paidAt and metadata.
- Payment indexes and unique identifiers.
- Protected payment initialization endpoint: `POST /payments`.
- Current user's payment history: `GET /payments/me`.
- Current user's payment detail: `GET /payments/me/:id`.
- Payment statuses: `pending`, `paid`, `failed`, `cancelled`.
- Payment gateway abstraction point; no real gateway is connected yet.
- Payment initialization prevents creating a payment when the user already has an active subscription.
- Reuses an existing pending payment for the same user and plan.
- Payment amount is snapshotted from the plan at payment creation time.

## Migration
`prisma/migrations/20260904103000_add_payment_core/migration.sql`

## Important
This version intentionally does not expose a client-controlled verify/paid endpoint. A real gateway provider and server-side callback/verification will be added in the next phase.

## Test flow
1. Run the migration against the database.
2. Start the backend.
3. Authenticate as a normal user.
4. Create a payment for an existing subscription plan with `POST /payments`.
5. Confirm the returned payment has `pending` status and the expected amount.
6. Repeat the same request and confirm the same pending payment is returned rather than creating a duplicate.
7. Check `GET /payments/me` and `GET /payments/me/:id`.

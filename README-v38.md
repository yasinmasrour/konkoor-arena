# Griffin Academy — Subscription Dashboard Card v38

Base: confirmed `konkoor-arena-subscription-frontend-v37.zip`.

## Changes
- Added `frontend/src/components/dashboard/SubscriptionDashboardCard.tsx`.
- Dashboard now fetches the authenticated user's current subscription from `GET /subscriptions/me`.
- Shows active plan, remaining days, start date, expiry date, and navigation to `/subscriptions`.
- Shows a no-active-subscription state with a link to subscription plans.
- Preserves v37 subscription page/API implementation and the previously confirmed v35-fixed frontend baseline.

## Validation
The source change was reviewed for TypeScript structure. A local dependency install/build could not be completed in the isolated build environment because package installation timed out; run the normal project `npm install`, `npm run build`, and `npm run lint` in the development environment.

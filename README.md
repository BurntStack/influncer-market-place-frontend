# XXXXXX — Creator Marketplace (Brand side)

React 18 + Vite frontend for the brand-side creator marketplace. It uses plain
JavaScript and CSS with React Router; there is no TypeScript or CSS framework.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
```

Copy `.env.example` to `.env` and configure `VITE_API_URL`,
`VITE_GOOGLE_CLIENT_ID`, and `VITE_APPLE_CLIENT_ID`. Only public OAuth client
IDs belong in Vite environment variables; provider secrets stay on the backend.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing home and creator discovery CTA |
| `/creators` | Search, filters, sorting, pagination and creator cards |
| `/creators/:id` | Authenticated profile, packages, cart and offers |
| `/login` | Email/password login and OAuth |
| `/signup` | Email → verification code → password signup |
| `/onboarding` | Brand details after signup |
| `/dashboard` | Authenticated dashboard home |
| `/dashboard/search` | API-backed creator search |
| `/dashboard/lists` | Shortlists and list management |
| `/dashboard/jobs` | Campaign listing and post-job form |
| `/dashboard/deliverables` | Content library, filters and export |
| `/dashboard/orders` | Orders, escrow actions and approvals |
| `/dashboard/reporting` | Reporting charts, period filter and CSV export |

## API and data behavior

`src/lib/apiClient.js` prefixes requests with `VITE_API_URL`, attaches the
stored bearer token, normalizes documented error envelopes, and clears expired
tokens on protected 401 responses. The contract is in
[`docs/API.md`](docs/API.md), with the machine-readable version in
[`docs/openapi.yaml`](docs/openapi.yaml).

All public creator flows and dashboard pages call the API. Local data in
`src/data/` remains a graceful fallback when the backend is unavailable or
cold-starting. API-backed controls include creator save/unsave, cart items,
custom offers, list CRUD, campaign creation, order actions, deliverables export,
and reporting export.

## Authentication

Signup is intentionally staged:

1. Submit an email to `/auth/signup/email`.
2. Verify the emailed code with `/auth/signup/verify-email`.
3. Create the password with `/auth/signup/complete`.

Google and Apple buttons load their browser SDKs, obtain an ID token, and
exchange it through `/auth/oauth/google` or `/auth/oauth/apple`. The backend
must validate provider tokens and allow the configured frontend origins.

## Project structure

```text
src/api/          API endpoint wrappers
src/components/   Marketing, creator-card, auth and dashboard components
src/data/         Local fallback catalogue/dashboard data
src/lib/          API client and auth/session helpers
src/pages/        Marketing, auth, onboarding and dashboard routes
src/styles/       Global CSS and design tokens
docs/             API contract, OpenAPI schema and project log
```

## Verification

```bash
npm run build
```

There is currently no automated test or lint suite in the project.

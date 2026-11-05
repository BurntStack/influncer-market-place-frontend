# Collab API integration

Base URL: `https://collab-api-ewju.onrender.com/v1`

Every response uses `{ success, data, error, meta }`. Except for OTP login
and token refresh, requests carry `Authorization: Bearer <access>`. Access
tokens are refreshed through `/auth/token/refresh/`. Money is sent in paise
and converted to rupees for display. Lists use `limit` (maximum 50) and
`meta.nextCursor`.

## Connected frontend flows

| Frontend | API routes |
| --- | --- |
| SMS login and signup | `/auth/otp/request/`, `/auth/otp/verify/`, `/auth/token/refresh/`, `/auth/signup/complete/`, `/auth/logout/`, `/auth/me/` |
| Creator discovery and profile | `/creators/`, `/creators/{id}/`, `/creators/{id}/reviews/` |
| Brand profile | `/brands/me/` |
| Lists and favorites | `/lists/`, `/lists/{id}/`, list creator add/remove routes |
| Campaigns and bids | `/campaigns/`, `/campaigns/{id}/`, `/campaigns/{id}/bids/`, bid selection |
| Orders and deliverables | `/orders/`, `/orders/{id}/`, `/orders/{id}/deliverables/`, revisions, approval |
| Custom offers | `/offers/` |
| Notifications | `/notifications/`, notification read |

## Waiting on backend details

- A brand-facing route for a selected creator's packages. Only
  `/creators/me/packages/` is documented. Embedded packages in creator detail
  are supported; otherwise package booking is disabled.
- Reporting and CSV export routes. The reporting page states that it is
  coming soon instead of showing demo statistics.
- An approved OTP test number/code and example authenticated responses for
  end-to-end verification.
- Confirmation of required values for `usageRights` on campaigns and offers.

The public homepage still uses example creator cards because the API requires
bearer authentication for discovery. Creator profiles remain login-gated.

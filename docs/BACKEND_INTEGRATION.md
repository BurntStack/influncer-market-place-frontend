# Collab API integration

Base URL: `https://collab-api-ewju.onrender.com/v1`

Every response uses `{ success, data, error, meta }`. Except for OTP login
and token refresh, requests carry `Authorization: Bearer <access>`. Access
tokens are refreshed through `/auth/token/refresh/`. Money is sent in paise
and converted to rupees for display. Lists use `limit` (maximum 50) and
`meta.nextCursor`.

An OTP login starts a 15-day client session. Access tokens are refreshed as
needed; a temporary refresh network error does not clear the saved session.
The backend must keep refresh tokens valid for 15 days for this to work for
the full period. We have asked Rohith to confirm its refresh-token lifetime.

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
| Brand logo and private file links | `/uploads/`, signed PUT URL, `/uploads/{id}/complete/`, `/uploads/{id}/download-url/` |
| Messages | `/conversations/`, `/conversations/{id}/messages/`, `/conversations/{id}/read/` |
| Live updates | `/realtime/ticket/`, then `/ws/?ticket=...` with reconnect and ping |

The brand workspace can upload a logo, open permitted creator conversations,
send text or image/PDF attachments, page through older messages, and open
private delivered files using short-lived download URLs. Notifications and
open chats refresh when WebSocket events arrive. Creator avatar, gallery,
draft-file upload, and creator messaging APIs have reusable client helpers;
their workspace remains the requested Coming soon page.

## Waiting on backend details

- A brand-facing route for a selected creator's packages. Only
  `/creators/me/packages/` is documented. Embedded packages in creator detail
  are supported; otherwise package booking is disabled.
- Reporting and CSV export routes. The reporting page states that it is
  coming soon instead of showing demo statistics.
- An approved OTP test number/code and example authenticated responses for
  end-to-end verification.
- Confirmation of required values for `usageRights` on campaigns and offers.
- Email verification request/confirm endpoints and a supported way to save a
  brand email. The signup form collects email and displays its verification
  status, but cannot mark it verified without a backend confirmation response.

The public homepage still uses example creator cards because the API requires
bearer authentication for discovery. Creator profiles remain login-gated.

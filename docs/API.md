# API Specification — Creator Marketplace (Brand side)

> Contract required by the React frontend. Request/response field names match
> what the UI already consumes, so no translation layer is needed on either end.
>
> **Machine-readable version:** [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.0.3,
> 39 endpoints, 16 schemas). Use it to generate server stubs / a client SDK /
> Postman collection, e.g. `npx @openapitools/openapi-generator-cli generate
> -i docs/openapi.yaml -g spring -o server/`, or import the file into Postman
> or Swagger Editor (editor.swagger.io).

- **Base URL:** `/api/v1`
- **Format:** JSON over HTTPS
- **Auth:** `Authorization: Bearer <token>` (all endpoints except `GET /creators*`, `/creators/suggestions`, `/creators/filters`, and `/auth/*`)
- **Currency:** all money is **INR integers** (e.g. `8000` = ₹8,000). Where the UI shows a formatted value, also send a display string.
- **Pagination envelope (used by every list):**
  ```jsonc
  { "results": [ /* ... */ ], "total": 2480, "page": 1, "pageSize": 12, "totalPages": 207 }
  ```

---

## Shared data shapes

### Creator (card / list form)
```jsonc
{
  "id": "ananya-rao",
  "name": "Ananya Rao",
  "category": "Beauty, Skincare",
  "location": "Bengaluru",
  "followers": "48.2k",          // display string
  "followerCount": 48200,        // numeric — sorting/filtering
  "platform": "Instagram",       // Instagram | YouTube | Facebook | X | LinkedIn | ...
  "rating": 4.9,
  "reviewCount": 42,
  "priceFrom": 8000,             // INR
  "deliverable": "1 Instagram Reel (30–45 sec)",
  "quotes": ["Delivered two days early", "Great with brand guidelines"],
  "image": "https://cdn/.../ananya.jpg",
  "topCreator": true
}
```

### Creator (full profile) — extends the above with
```jsonc
{
  "bio": "Beauty creator based in Bengaluru...",
  "gallery": ["https://cdn/.../1.jpg", "..."],
  "badges": ["Top Creator", "Replies within 2 hours"],
  "repliesWithin": "2 hours"
}
```

### Package
```jsonc
{ "id": "pkg_1", "title": "1 Instagram Reel (30–45 sec)", "note": "Posted to your product feed with a tagged mention.", "price": 8000, "platform": "Instagram" }
```

### Review
```jsonc
{ "id": "rev_1", "name": "Shreya S.", "avatar": "https://...", "stars": 5, "date": "2025-09-01", "text": "Delivered a day early..." }
```

---

## 1. Auth — nav "Log in" / "Sign up"

| Method | Path | Purpose | Request body | Response |
|--------|------|---------|--------------|----------|
| `POST` | `/auth/signup` | Register a brand account | `{ name, email, password, companyName }` | `{ token, user }` |
| `POST` | `/auth/login` | Log in | `{ email, password }` | `{ token, user }` |
| `POST` | `/auth/logout` | Invalidate session | — | `204` |
| `GET`  | `/auth/me` | Current user (drives signed-in vs signed-out nav + route guards) | — | `{ user }` |
| `POST` | `/auth/oauth/google` | Google sign-in | `{ idToken }` | `{ token, user }` |
| `POST` | `/auth/oauth/apple` | Apple sign-in | `{ idToken }` | `{ token, user }` |

`user`: `{ id, name, email, companyName, role: "brand" }`

> **Route gating (frontend):** creator profiles (`/creators/:id`) and the whole
> `/dashboard/*` area are login-gated. Unauthenticated access redirects to
> `/login`. The server must still enforce auth on the corresponding endpoints —
> client-side gating is UX only.

---

## 2. Creators — search & discovery (Home hero + Find Creators page)

### `GET /creators`
Paginated search/list. All query params optional.

| Param | Example | Notes |
|-------|---------|-------|
| `q` | `skincare` | free text over name/category/location |
| `platform` | `Instagram` | |
| `category` | `Beauty` | |
| `city` | `Bengaluru` | |
| `priceMin` / `priceMax` | `0` / `10000` | INR |
| `followersMin` / `followersMax` | `10000` / `100000` | |
| `gender` / `age` / `language` / `audienceLocation` | | filter chips |
| `sort` | `recommended` | `recommended` \| `price_asc` \| `price_desc` \| `followers` \| `trending` |
| `page` / `pageSize` | `1` / `12` | |

**Response:** pagination envelope of `Creator[]`.

### `GET /creators/suggestions`
Chips shown under the hero search ("Trending on Instagram", "Under ₹5,000", …).
```jsonc
[ { "label": "Trending on Instagram", "query": { "platform": "Instagram", "sort": "trending" } } ]
```

### `GET /creators/filters`
Available filter options so the UI dropdowns aren't hardcoded.
```jsonc
{ "platforms": [...], "cities": [...], "categories": [...], "languages": [...], "priceBuckets": [{ "label": "Under ₹5,000", "max": 5000 }] }
```

---

## 3. Creator profile — `/creators/:id`

| Method | Path | Purpose | Response |
|--------|------|---------|----------|
| `GET` | `/creators/:id` | Full profile | Creator (full) |
| `GET` | `/creators/:id/packages` | Bookable packages | `Package[]` |
| `GET` | `/creators/:id/reviews?page=&pageSize=` | Reviews | `{ ...envelope, rating: 4.9 }` of `Review[]` |
| `GET` | `/creators/:id/similar` | Similar creators | `Creator[]` (3) |
| `POST` | `/creators/:id/save` | Add to shortlist (heart) | `204` |
| `DELETE` | `/creators/:id/save` | Remove from shortlist | `204` |

---

## 4. Cart & custom offers — booking card

| Method | Path | Purpose | Body |
|--------|------|---------|------|
| `GET` | `/cart` | Current cart | — → `{ items: [{ id, creator, package, quantity, lineTotal }], subtotal }` |
| `POST` | `/cart/items` | Add a package | `{ creatorId, packageId, quantity }` |
| `PATCH` | `/cart/items/:itemId` | Change quantity | `{ quantity }` |
| `DELETE` | `/cart/items/:itemId` | Remove item | — |
| `POST` | `/offers` | "Send a custom offer" | `{ creatorId, deliverable, budget, message, deadline }` |

---

## 5. Campaigns — "Post a Job. Let Creators Bid."

| Method | Path | Purpose | Body / notes |
|--------|------|---------|--------------|
| `POST` | `/campaigns` | Post a job | `{ title, platform, deliverables, budgetMin, budgetMax, applyBy, brief }` |
| `GET` | `/campaigns` | Brand's campaigns | → `[{ id, title, status, platform, budgetMin, budgetMax, applyBy, bidCount, proposalAvatars }]` |
| `GET` | `/campaigns/:id` | One campaign | includes `status`: `open_for_bids` \| `closed` \| `awarded` |
| `GET` | `/campaigns/:id/bids` | Bids list | `[{ id, creator: { id, name, note, avatar }, price, status }]` |
| `POST` | `/campaigns/:id/bids/:bidId/select` | Pick a creator | creates an Order in escrow, returns `{ order }` |
| `PATCH` | `/campaigns/:id` | Edit a job (the "Edit" button) | body = editable fields |
| `DELETE` | `/campaigns/:id` | Delete a draft/job | — |

---

## 6. Orders & escrow — "Money moves only when you approve"

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/orders` | Brand's orders → `[{ id, creator, deliverable, amount, status }]` |
| `GET` | `/orders/:id` | One order |
| `POST` | `/orders/:id/pay` | Fund escrow — returns payment-provider intent/client token |
| `POST` | `/orders/:id/request-changes` | Body `{ note }` — "Request changes" button |
| `POST` | `/orders/:id/approve` | "Approve & pay" — releases escrow to creator |
| `GET` / `POST` | `/orders/:id/messages` | Brief / chat thread (optional) |

**Order status machine:** `in_escrow` → `draft_submitted` → (`changes_requested` → `draft_submitted`)* → `released` → `completed`.

---

## 7. Dashboard (logged-in brand app)

### Home
| Method | Path | Purpose | Response |
|--------|------|---------|----------|
| `GET` | `/dashboard/summary` | Home screen data | `{ greetingName, todos: [{ id, label, done }], stats: [{ label, value, sub }], topCreators: Creator[] }` |
| `PATCH` | `/dashboard/todos/:id` | Tick an onboarding task | `{ done }` |

### Lists (shortlists)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/lists` | → `[{ id, name, count, updatedAt, covers: string[] }]` |
| `POST` | `/lists` | Create a list — `{ name }` |
| `GET` | `/lists/:id` | List detail + its creators |
| `POST` | `/lists/:id/creators` | Add a creator — `{ creatorId }` |
| `DELETE` | `/lists/:id/creators/:creatorId` | Remove a creator |
| `PATCH` | `/lists/:id` | Rename a list — `{ name }` (the "•••" menu) |
| `POST` | `/lists/:id/duplicate` | Duplicate a list (the "•••" menu) |
| `DELETE` | `/lists/:id` | Delete the list |

### Deliverables (content library)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/deliverables` | `?q=&jobId=&platform=&from=&to=` → `[{ id, content, type, creator, job, deliveredAt, status }]` |
| `GET` | `/deliverables/:id` | One deliverable (preview/download URL) |
| `GET` | `/deliverables/export` | "Download all" (zip/CSV) |

`status`: `Approved` | `Needs review` | `Live` | `Revision asked`.

### Reporting
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/reporting?period=last_6_months` | `{ stats: [...], viewsByMonth: [{ month, instagram, youtube }], spendByPlatform: [{ label, amount, pct }], topCreators: [{ creator, posts, views, engagement, spend, costPer1k }] }` |
| `GET` | `/reporting/export?period=` | CSV export |

> **Jobs** and **Orders** dashboard pages reuse the endpoints in sections 5 and 6
> (jobs list with tab counts; orders list with escrow stats). The dashboard
> **Search** page reuses `GET /creators` from section 2.

---

## UI filter → query-param mapping

The dashboard/search filter **dropdowns** are already interactive on the
frontend; each maps to a query param on its list endpoint. Returning the
available options from `GET /creators/filters` (and equivalents) keeps them
data-driven instead of hardcoded.

| UI dropdown | Endpoint | Param |
|-------------|----------|-------|
| Platform | `GET /creators` | `platform` |
| Content type | `GET /creators` | `contentType` |
| Followers | `GET /creators` | `followersMin` / `followersMax` |
| Location / City | `GET /creators` | `city` |
| Price | `GET /creators` | `priceMin` / `priceMax` |
| Gender / Age / Language | `GET /creators` | `gender` / `age` / `language` |
| Sort | `GET /creators` | `sort` |
| Deliverables: Job / Platform / Date | `GET /deliverables` | `jobId` / `platform` / `from`+`to` |
| Reporting: period | `GET /reporting` | `period` (`last_30_days` \| `last_3_months` \| `last_6_months` \| `last_12_months` \| `all_time`) |

## Implementation notes

- **Escrow/payments:** `pay` and `approve` integrate your payment provider (e.g. Razorpay) — start in **test mode**. `/orders/:id/pay` should return a client token/intent the frontend can confirm.
- **Images:** return absolute URLs for `image`, `gallery`, and `avatar`.
- **Static content** (testimonials, "trusted by" logos, footer links) is hardcoded in the UI — **no API required** unless you want it CMS-driven.
- **Errors:** use standard HTTP codes with `{ "error": { "code": "...", "message": "..." } }`.
- **CORS:** allow the web app origin; send `Authorization` header.

## Priority for first milestone
1. `GET /creators` (search) + `GET /creators/:id` (+ packages, reviews, similar) — unblocks the whole browse/profile experience.
2. `/auth/*` — enables signed-in state.
3. Cart + Orders/escrow — enables the booking + payment flow.
4. Campaigns/bids — enables the "post a job" flow.

# Project Work Log — Creator Marketplace (Brand side)

A running record of what has been built on the frontend, the decisions made,
and the current state of the project.

_Last updated: 2026-10-27_

---

## 1. Overview

A **React + JavaScript** frontend for a creator/influencer marketplace, built
to match the **Figma "brand-side"** design
(`figma.com/design/4695hkE37e3FDq55vy6bNT/brand-side`). It is a marketing +
discovery experience for brands to find creators, post campaigns, and pay
through escrow.

- **Framework:** React 18 + Vite 5 (JavaScript, no TypeScript)
- **Routing:** React Router v6
- **Styling:** plain CSS with design tokens (no CSS framework)
- **State/data:** local React state + a mock data module (no backend yet)

---

## 2. Tech stack & tooling

| Concern | Choice |
|---------|--------|
| Build tool | Vite 5 (`npm run dev` / `build` / `preview`) |
| UI library | React 18 |
| Routing | `react-router-dom` v6 (future flags enabled for v7) |
| Styling | CSS files + CSS custom properties (tokens) |
| Fonts | Inter (Google Fonts) |
| Images | `picsum.photos` placeholders (to be swapped for real URLs) |

### Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

---

## 3. Project structure

```
src/
  main.jsx                     # entry; BrowserRouter (+ v7 future flags)
  App.jsx                      # routes + shared Navbar/Footer
  styles/
    tokens.css                 # design tokens (colors, radii, spacing) from Figma
    global.css                 # resets, layout helpers, button + card primitives
  components/
    Navbar.jsx / .css          # dark pill nav with working mega-menu dropdowns
    Footer.jsx / .css          # dark footer with link columns
    Dropdown.jsx / .css        # reusable dropdown/menu (filters, sorts, menus)
    HeroCreatorCard.jsx / .css # creator tile with quote bubbles (home hero grid)
    CreatorCard.jsx / .css     # creator tile for the /creators listing
    HiringSteps.jsx / .css     # "Post a Job. Let Creators Bid." 5-step section
    MarketingLayout.jsx        # nav + footer shell for public pages
    ScrollToTop.jsx            # resets scroll on route change
    dashboard/
      DashboardLayout.jsx / .css  # sidebar + top bar (desktop) / tab bar (mobile)
      DashCreatorCard.jsx / .css  # creator tile for the dashboard
  pages/
    Home.jsx / .css            # the single landing page (all sections)
    FindCreators.jsx / .css    # search + filters + results grid
    CreatorProfile.jsx / .css  # gallery, packages, reviews, booking card
    auth/
      AuthPage.jsx / .css      # login + signup (split layout, mode prop)
    dashboard/
      DashHome / DashSearch / DashLists / DashJobs /
      DashDeliverables / DashOrders / DashReporting  (.jsx + .css each)
      dash-pages.css           # shared stat cards, tabs, tables, pills
  data/
    creators.js                # mock creator catalogue (swap for the real API)
    dashboard.js               # mock dashboard data (jobs, orders, lists, etc.)
docs/
  API.md                       # backend API contract
  PROJECT_LOG.md               # this file
```

---

## 4. Routes

| Path | Screen |
|------|--------|
| `/` | Home (brand landing page) |
| `/creators` | Find creators (search/listing) |
| `/creators/:id` | Creator profile |
| `/login`, `/signup` | Auth (split-layout) |
| `/dashboard` | Dashboard — Home |
| `/dashboard/search` | Dashboard — Search |
| `/dashboard/lists` | Dashboard — Lists |
| `/dashboard/jobs` | Dashboard — Jobs |
| `/dashboard/deliverables` | Dashboard — Deliverables |
| `/dashboard/orders` | Dashboard — Orders |
| `/dashboard/reporting` | Dashboard — Reporting |

Routing uses three layouts: `MarketingLayout` (nav + footer) for the public
pages, standalone auth pages, and `DashboardLayout` (sidebar/top-bar on desktop,
top-bar + bottom tab bar on mobile) for the logged-in app.

> Note: the Figma file currently contains only the **Home** frame (the
> standalone "Find creators" and "Creator profile" frames were removed in a
> later revision). The `/creators` and `/creators/:id` pages are kept because
> they are functional and the hero search/cards link into them. They can be
> removed if we want the site to mirror the Figma strictly as one landing page.

---

## 5. Design system (from Figma)

The Figma file defines no design variables, so tokens were derived visually and
centralised in `src/styles/tokens.css`:

- **Accent:** pink `#ff2e88` (hover `#e61f76`), with a glow for primary buttons
- **Dark surfaces:** `#141414` / `#1c1c1c` (nav, footer, dark sections)
- **Light surfaces:** page `#f4f4f5`, cards `#ffffff`, borders `#e6e6e8`
- **Radii:** 8 / 12 / 18 / 24 px and a pill radius
- **Logo:** placeholder wordmark **"XXXXXX"** (kept exactly as in Figma — no
  invented brand name)

Reusable primitives in `global.css`: `.btn` variants (`--primary`, `--outline`,
`--ghost-dark`, `--dark`, `--white`, sizes `--sm`/`--lg`), `.card`, `.container`,
`.section`, `.eyebrow`.

---

## 6. Pages & sections built

### Home (`/`) — faithful to the Figma landing frame, top to bottom:
1. **Hero** — search bar (platform dropdown + query + pink Search) with
   suggestion chips and an **8-card creator grid**. Each card shows follower
   count, save heart, quote bubbles, name/category and price.
2. **"From First Search to Final Payout"** — section heading + subtitle.
3. **Step 1 — "Shortlist the Right Creator in Minutes"** with a filter-chips +
   creator-list preview card.
4. **Step 2 — "Post One Brief. Let Creators Apply."** with a "Diwali gift box
   launch" campaign preview card (platform, deliverables, budget, apply-by, 24
   proposals). Reversed layout.
5. **Step 3 — "Money Moves Only When You Approve."** with an escrow approval
   card (Draft submitted, Held in escrow, Request changes / Approve & pay).
6. **Logo cloud** — "Trusted by 1,200+ Indian brands…" wordmarks.
7. **"Swap Six Tools for One"** — three stat cards with struck-through
   before → after values (4 weeks→3 days, 6 tools→1 dashboard, 0%→100%).
8. **"What Brand Teams Tell Us"** — dark testimonials with avatars + star ratings.
9. **"Post a Job. Let Creators Bid."** — full 5-step "how hiring works" timeline
   next to a detailed job/bid card (budget-range slider, bids, escrow status).
10. **Final CTA** — "Your Next Creator Campaign Starts in Five Minutes."

### Find Creators (`/creators`)
- Results heading, search bar (platform + query), filter chips, sort control.
- Responsive creator-card grid with working client-side filtering.
- Inline "Can't pick? Let creators come to you." campaign band + pagination.

### Creator Profile (`/creators/:id`)
- Photo gallery, creator header (rating, reviews, location, badges), bio.
- Packages list with per-deliverable pricing (tabbed).
- Reviews section and "Similar creators".
- Sticky **booking card**: price, deliverable select, quantity stepper,
  "Add to cart", "Send a custom offer", escrow reassurance note.

---

## 7. Navigation & mega-menu

- Dark pill nav matching Figma; signed-out variant (**Log in** + **Sign up**).
- Three **mega-menu dropdowns** mirrored from the Figma nav states:
  - **Features** (7 items, 2 columns)
  - **For Brands** (Marketing Teams, Agencies, Founders, Enterprise + Case Studies)
  - **Use Cases** (UGC for Ads, Influencer Marketing, Affiliate Marketing)
  - **Pricing** is a plain link (no dropdown).
- Each item renders a coloured icon tile + title + description.
- **Interaction:** hover-to-open on pointer devices, single tap-to-toggle on
  touch. A cancelable close delay + an invisible hover bridge keep the panel
  open while moving the cursor into it.

---

## 7b. Auth & logged-in dashboard

**Auth** (`/login`, `/signup`) — one `AuthPage` component driven by a `mode`
prop. Split layout: dark promo panel (headline, floating creator cards + escrow
badges, "25,000+ brands and creators" social proof) and a white form card
(email-first sign up, or email + password log in, with Google/Apple options).
On submit it routes to `/dashboard`. Responsive: the promo panel collapses above
the form on mobile.

**Dashboard shell** (`DashboardLayout`) — desktop sidebar (logo, "Post a job",
7 nav links with icons + Orders badge, user chip) and a sticky top bar (page
title, search, chat, notifications). On mobile it becomes a top bar + a fixed
bottom tab bar (Home / Search / Jobs / Orders / More), where **More** opens a
bottom sheet with Lists, Deliverables, Reporting.

**7 dashboard pages**, each responsive and faithful to the Figma:
- **Home** — greeting, onboarding To-do card with progress, 4 KPI stat cards,
  "Explore top creators" grid.
- **Search** — search bar, filter chips, creator grid, pagination.
- **Lists** — shortlists as collage cards.
- **Jobs** — status tabs, job cards with budget-range bars + bid avatars +
  actions, and a "Recently completed" panel.
- **Deliverables** — searchable content library table with status pills.
- **Orders** — escrow stat cards, status tabs, orders table (payment/status).
- **Reporting** — KPI cards, a CSS bar chart (views by month), spend-by-platform
  bars, and a top-creators table.

Shared dashboard building blocks live in `dash-pages.css` (stat cards, tabs,
tables, status pills, budget bars) and `DashCreatorCard`.

## 8. Responsive design (from the Figma mobile frames)

Matched to the **Brand – Home (Mobile)** (390px) and **Mobile nav** frames:

- **Mobile nav:** white dropdown panel with accordion sub-menus, plus **Log in**
  (outline) and **Sign up free** (dark) buttons at the bottom; bar shows logo +
  Sign up + toggle.
- **Hero creator grid** stays **2 columns** on phones.
- **Feature rows** stack text-over-card (including the reversed Step 2).
- Logo cloud, stat cards, and testimonials collapse to a single column; the
  journey heading left-aligns on mobile.
- "How hiring works" timeline, footer, and final CTA all reflow.

---

## 9. Timeline of changes

| Step | What was done |
|------|---------------|
| 1 | Verified access to the Figma brand-side file; pulled frames & screenshots. |
| 2 | Cleared the folder to a clean slate (at the user's request). |
| 3 | Scaffolded the Vite + React + JS app: routing, tokens, Navbar/Footer, 3 pages, mock data, hero CTA. |
| 4 | Figma updated → restructured Home to a single landing page: new search+grid hero, rich "How hiring works" section; updated creator data. |
| 5 | Added the Navbar **mega-menu dropdowns** (Features / For Brands / Use Cases) from the Figma nav states. |
| 6 | Reverted the invented brand name back to the Figma placeholder **"XXXXXX"**. |
| 7 | Full fidelity pass on all middle sections (journey steps, preview cards, logo cloud, swap-six-tools stats, testimonials); switched nav to the signed-out Log in / Sign up variant. |
| 8 | Implemented the **responsive** design from the new Figma mobile frames (mobile nav + mobile home). |
| 9 | Fixed the mega-menu "needs two clicks" bug (hover-open vs click-toggle conflict). |
| 10 | Fixed menu items disappearing on hover (cancelable close delay + hover bridge). |
| 11 | Cleared **console warnings** — enabled React Router v7 future flags; verified a clean console via a headless-browser capture across all pages. |
| 12 | Figma added the full logged-in experience → built **auth** (login/signup) and the **dashboard** (shell + 7 pages: Home, Search, Lists, Jobs, Deliverables, Orders, Reporting), all responsive. Refactored routing into marketing / auth / dashboard layouts. Verified clean console + screenshots (desktop + mobile) via headless capture. |
| 13 | Made **all dropdowns functional** — added a reusable `Dropdown` component (click to open, outside-click/Escape to close, selection updates the label) and wired it into every filter chip, sort, period picker, the Lists "•••" menu, and the sidebar user menu, across the dashboard and the public Find Creators page. Verified open/select/close behaviour in a real browser. |

---

## 10. Current state

- ✅ Production build is green (`npm run build`, ~52 modules).
- ✅ Console is clean (no errors/warnings; verified headless across `/`, `/creators`, `/creators/:id`).
- ✅ Desktop + mobile layouts match the Figma.
- ✅ Auth (`/login`, `/signup`) and the full dashboard (`/dashboard/*`) are built
  and responsive; all dropdowns/filters are interactive.
- ⚠️ All data is **mock** (`src/data/creators.js`, `src/data/dashboard.js`); no
  backend wired yet. Auth "submit" routes straight to `/dashboard` (no real auth
  or route guard). Filter selections update the UI but don't yet re-query data.

---

## 11. Next steps

1. Backend implements the endpoints in **`docs/API.md`**.
2. Add an `apiClient` (fetch wrapper with auth header) + per-feature API modules.
3. Replace mock `creators.js` with live `GET /creators` / `GET /creators/:id`.
4. Wire auth (Log in / Sign up), cart, campaigns, and the escrow order flow.
5. Decide whether to keep or remove the `/creators*` pages (not in current Figma).
6. Add real assets (logos, creator images) and swap out `picsum.photos`.

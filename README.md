# LinkLoom

React 18 + Vite frontend for a brand and creator marketplace.

## Run locally

```bash
npm install
npm run dev
npm run test:api
npm run build
npm run preview
```

The backend base URL defaults to `https://collab-api-ewju.onrender.com/v1`.
Override it with `VITE_COLLAB_API_URL` if needed. The first request to the free
server can take about a minute after it has been idle.

## Backend integration

The frontend uses SMS OTP login, access and refresh tokens, the API's
`{ success, data, error, meta }` envelope, cursor pagination, and paise for
all money sent to the server. Brand lists, creator search, campaigns, bids,
orders, deliverables, brand profile, and notifications use the new API. The
public homepage shows demo creators because creator discovery requires login.

The creator workspace is a Coming soon page. Reporting and exports also await
backend routes. The brand-facing creator packages route is missing, so package
booking is disabled; custom offers remain available. See
[`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md).

## Search visibility

The production build pre-renders `/` and `/creators` with visible HTML, unique
titles and descriptions, canonical URLs, JSON-LD, `robots.txt`, and
`sitemap.xml`. Set `SITE_URL` to the preferred production origin when using a
custom domain. Otherwise the build uses Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`, then the current LinkLoom Vercel alias.
Preview builds emit `noindex`. Authenticated pages are excluded from indexing.

After deploying, add the production domain to Google Search Console and submit
`/sitemap.xml`.

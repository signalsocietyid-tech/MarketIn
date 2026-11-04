# MarketIn

**Where Businesses Meet Growth Opportunities.**

MarketIn is a business growth & partnership marketplace that connects **businesses** with **independent sales partners & distributors**, **creators & affiliates (KOLs, UGC creators)** and **agencies**. This repository contains the MVP: a public website, a working marketplace, role-based dashboards, a plan-driven subscription system and an admin console.

> Status: functional MVP running on a local mock data store. Supabase schema and payment-gateway adapters are prepared but not connected. See [What still uses mock data](#what-still-uses-mock-data).

---

## Quick start

Requirements: Node.js 20.9+ (tested with Node 26) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed for the demo.

For a production build (requires `SESSION_SECRET` in `.env.local`, see below):

```bash
npm run build
npm run start
```

### Deployment

`main` deploys automatically to Vercel (project `signalsocietyid-tech/market-in`). Required Vercel environment variable: `SESSION_SECRET`. With the mock data provider each serverless instance keeps its own in-memory copy of the demo data, so registrations and edits are not durable there; that's fine for demos and is solved by the Supabase adapter.

### Demo accounts

The login page has one-click **Explore the demo** buttons (Business, Sales Partner, Creator, Agency, Admin). They only appear while `DATA_PROVIDER=mock`.

| Role | Email | Plan |
| --- | --- | --- |
| Business | `business@marketin.demo` | Business Pro |
| Sales Partner | `sales@marketin.demo` | Sales Free (shows locked Pro features) |
| Creator & Affiliate | `creator@marketin.demo` | Creator Pro |
| Agency | `agency@marketin.demo` | Agency Pro |
| Admin | `admin@marketin.demo` | — |

All seeded accounts share the password in `DEMO_PASSWORD` in [src/lib/data/seed.ts](src/lib/data/seed.ts). All companies, people and figures in the seed are fictional.

**Resetting data:** mock data is saved to `.data/marketin-db.json` so registrations survive restarts. Delete that file (or use **Admin → Overview → Reset demo data**) to restore the seed.

---

## Implemented features

**Public website**
- Homepage with all 11 sections: hero with an illustrative dashboard preview, user segmentation, marketplace categories, how it works, why MarketIn, a distinct agency section, membership & pricing (monthly/yearly toggle), trust & community with sample profiles, tabbed FAQ, final CTA, footer.
- Sticky navbar with active states and a mobile drawer; full footer. Every footer link resolves to a real page.
- Segment landing pages (`/for-business`, `/for-sales-partners`, `/for-creators`, `/for-agencies`), `/how-it-works`, `/pricing` with plan comparison tables, plus About, Contact, Careers, Partnership, Blog, Insights, Help Center, FAQ, and draft Terms / Privacy / Cookie policy.

**Accounts & onboarding**
- `/register`: choose one of four account types, then a multi-step onboarding form specific to that type (React Hook Form + Zod, per-step validation). Business logo upload included. Supports `?type=` preselection and `?plan=` → continues to checkout.
- `/login`, `/forgot-password` (no email sending in mock mode), password change in `/settings`.
- Signed session cookie (HMAC, httpOnly) with a proxy guard plus server-side role checks.

**Marketplace**
- `/marketplace` hub and `/marketplace/{sales,affiliate,kol,agencies}`, each with an **Opportunities** and a **Partners** tab.
- URL-driven search & filters: category, type, industry, location, compensation, budget, experience, platform, verification, remote, sort. Partner filters: sales experience, industry expertise, coverage, specialization; creator platform, niche, audience size, engagement rate, creator type; agency category & services.
- "Advanced" filters and premium listings are gated by plan entitlements, on the server as well as in the UI. Premium terms are masked server-side.
- `/opportunities/[id]` detail page with apply dialog (agencies can apply on behalf of a talent), save, report, and similar listings.
- `/profiles/[id]` public profiles for all four segments, with role-specific sections, reviews and ratings.

**Dashboards** (`/dashboard`, different for each account type)
- Business: overview, opportunity management (create / edit / pause / close, premium listings), applicant review with status changes (Pending → Under Review → Shortlisted → Accepted / Rejected → Completed), applications received, partnerships, saved partners, analytics.
- Sales partner & creator: overview, recommended opportunities (profile-match scoring), my applications (withdraw), active partnerships, saved items, performance analytics.
- Agency: overview, talent roster, team members and invitations, opportunity inbox, proposals, partnerships, agency analytics.
- Shared: notifications, profile editor with verification request, profile-strength checklist, subscription page, settings.
- Accepting an application creates a partnership automatically; both sides can review each other.

**Subscriptions**
- Free and Pro plans for each segment, monthly and yearly billing, plan comparison, upgrade / scheduled downgrade / resume / cancel-pending UI, subscription history, usage meters.
- Feature access is driven entirely by plan data (`entitlements` and `limits`), which admins edit. Nothing is hardcoded per plan.
- Checkout records a **pending** upgrade request through a payment-provider interface. **No payment is ever simulated as successful.** Admins activate manually after confirming payment outside the platform.

**Admin console** (`/admin`)
- Marketplace statistics and charts, users & verification (activate / suspend / flag, verify / reject), opportunity moderation (feature, flag, close), application monitoring, reports queue, subscriptions (manual activation, cancel, event log), **plans & pricing editor** (prices, benefits, entitlements, limits, recommended, active), category (taxonomy) management, admin notifications, reset demo data.

---

## Project structure

```
src/
  app/
    (site)/            Public website: homepage, pricing, segment pages, marketplace,
                       opportunities/[id], profiles/[id], info & legal pages
    (auth)/            login, register, forgot-password (split-screen layout)
    (app)/             Signed-in app shell: dashboard/**, profile, settings, checkout
    admin/             Protected admin console
    api/payments/      Payment webhook endpoint (returns 501 until a gateway is connected)
    layout.tsx         Fonts, metadata, toaster
  proxy.ts             Optimistic route guard (Next.js 16 "proxy", formerly middleware)
  components/
    ui/                Primitives: button, form controls, card/badge/table, dialog/sheet/
                       dropdown/tabs/accordion/switch (Radix, shadcn-style)
    layout/            Navbar, Footer, AppShell (sidebar + topbar), PageHeader
    home/ marketing/   Homepage sections, segment landing, info-page layout
    marketplace/       Opportunity & profile cards, search filters, apply/report dialogs
    dashboard/         Widgets, charts (Recharts), forms, tables per dashboard page
    onboarding/        Registration wizard and reusable profile field groups
    pricing/           Pricing table (segment tabs, billing toggle)
    admin/             Admin tables, action menus, plan editor, category manager
    shared/            Status badges
    brand/             Logo and social icons
  content/             Copy and config: FAQ, segments, how-it-works, legal drafts, contact
  lib/
    types.ts           Domain model (mirrors the SQL schema)
    constants.ts       Labels and taxonomies
    validation.ts      Zod schemas shared by client forms and server actions
    permissions.ts     Role capabilities + plan entitlements/limits/usage
    auth/              Session cookie, password hashing
    data/              Mock store, seed data, read queries, dashboard insights
    actions/           Server actions: auth, marketplace, account/billing, admin
    payments/          Payment provider interface (mock, Midtrans/Xendit stubs)
    supabase/          Supabase browser/server clients (for DATA_PROVIDER=supabase)
supabase/
  migrations/0001_init.sql   Full Postgres schema with row-level security
  seed.sql                   Plans and taxonomies
docs/
  ARCHITECTURE.md      Decisions, data flow, how to switch to Supabase
  PAYMENTS.md          Payment integration plan
```

---

## Database schema

Defined in [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) and mirrored by [src/lib/types.ts](src/lib/types.ts).

| Table | Purpose / key relations |
| --- | --- |
| `users` | Marketplace account: `role` (business, sales, creator, agency, admin), `status` (active / suspended / flagged), `verification`. PK = `auth.users.id`. |
| `businesses` | 1:1 with `users`: company profile, industry, category, location, logo. |
| `sales_partners` | 1:1 with `users`: title, industries, experience, partnership types, areas, specializations. |
| `creators` + `creator_socials` | 1:1 creator profile; 1:N social accounts (platform, handle, url, followers). |
| `agencies` | 1:1 agency profile: category, services, team size, portfolio. |
| `talents` | N:1 agency → managed creators, affiliates and sales reps. |
| `team_members` | N:1 agency → staff seats and invitations. |
| `opportunities` | N:1 business; type, category, compensation model, budget, deliverables, deadline, status, premium / featured / flagged. |
| `applications` | N:1 opportunity, N:1 applicant (optional talent); status lifecycle. |
| `partnerships` | Created from an accepted application; business ↔ partner with reported metrics. |
| `reviews` | Reviewer → reviewee, linked to a partnership; 1–5 rating. |
| `saved_items` | User bookmarks for opportunities and profiles. |
| `notifications` | Per-user activity feed. |
| `reports` | User reports against users or opportunities, with moderation status. |
| `categories` | Admin-managed taxonomies (industry, niche, location). |
| `subscription_plans` | Admin-configurable plans: prices, benefits, `entitlements[]`, `limits` (jsonb). |
| `user_subscriptions` | A user's plan, billing cycle, status (active / pending_payment / canceled / expired), period. |
| `subscription_events` | Audit log of subscription changes. |

Row-level security policies are included: public profiles readable, owners write their own rows, businesses manage applications to their own listings, and admins moderate. Subscriptions are writable only by the service role (payment webhooks / admin).

---

## Environment variables

Copy `.env.example` to `.env.local`. Nothing is required for the local demo.

| Variable | Required | Description |
| --- | --- | --- |
| `DATA_PROVIDER` | no | `mock` (default) or `supabase` (adapter not yet implemented, see next steps). |
| `MOCK_DB_PERSIST` | no | `false` disables writing `.data/marketin-db.json`. Persistence is turned off automatically on Vercel. |
| `SESSION_SECRET` | **yes in production** | 32+ random characters used to sign the session cookie. In production (`npm run start`, Vercel) sign-in is disabled until it is set; there is no fallback. |
| `NEXT_PUBLIC_SUPABASE_URL` | with Supabase | Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | with Supabase | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | with Supabase | Server-only; used for webhooks and admin jobs. Never expose to the browser. |
| `PAYMENT_PROVIDER` | no | `mock` (default), `midtrans` or `xendit`. |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION` | with Midtrans | Midtrans Snap credentials. |
| `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN` | with Xendit | Xendit invoice credentials and webhook token. |

No credentials are committed or invented anywhere in the code.

---

## What still uses mock data

- **Data store and auth:** an in-memory store with JSON write-through (`src/lib/data/store.ts`) and custom cookie sessions. The Supabase schema is ready, but the Supabase data adapter isn't written yet.
- **Payments:** checkout creates `pending_payment` subscriptions only. Activation is manual by an admin; the webhook endpoint returns 501.
- **Email:** password-reset emails and team invitations are recorded but not sent.
- **Partnership metrics** (leads, conversions, revenue, reach) are values stored on each partnership in the seed; there is no tracking integration.
- **Social follower counts** are self-reported; there is no OAuth account connection.
- **Listing views** are seeded numbers and are not incremented.
- **Seed content** (companies, people, reviews, subscriptions) is fictional, and is labeled "illustrative" wherever it appears on marketing pages.
- **Contact addresses** (`hello@`, `support@`, `partnership@marketin.id`) and footer social links are placeholders to confirm before launch.
- **Legal pages** are drafts marked "not yet approved by legal counsel".
- **Prices** are initial assumptions, editable in Admin → Plans & pricing.

---

## Recommended next steps

1. **Supabase adapter:** implement `src/lib/data/queries.ts` and `src/lib/actions/*` against Supabase (the functions are already async), switch auth to Supabase Auth (`signUp` / `signInWithPassword` / `resetPasswordForEmail`), and run the migration + `seed.sql`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
2. **Payments:** implement the Midtrans Snap or Xendit Invoice adapter and the signed webhook ([docs/PAYMENTS.md](docs/PAYMENTS.md)), then retire manual activation for paid flows.
3. **Messaging:** a business ↔ partner conversation thread per application (the "communicate & negotiate" step).
4. **Transactional email:** application updates, invitations and password reset (e.g. Resend or Postmark via Supabase SMTP).
5. **Social verification:** OAuth connections for Instagram, TikTok and YouTube to verify follower counts and engagement.
6. **File storage:** logos, portfolios and verification documents in Supabase Storage instead of data URLs.
7. **Tracking:** affiliate link and voucher tracking so partnership metrics are measured, not reported.
8. **Testing & ops:** Playwright end-to-end tests for the role journeys, error monitoring, rate limiting on auth and server actions.
9. **Localization:** Bahasa Indonesia UI (the copy lives in `src/content/` and components).
10. **Legal review** of the Terms, Privacy (UU PDP No. 27/2022) and Cookie policy before launch.

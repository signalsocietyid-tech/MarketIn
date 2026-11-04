# MarketIn

**Where Businesses Meet Growth Opportunities.**

MarketIn is a business growth & partnership marketplace that connects **businesses** with **independent sales partners & distributors**, **creators & affiliates (KOLs, UGC creators)** and **agencies**. This repository contains the MVP: a public website, a working marketplace, role-based dashboards, a plan-driven subscription system and an admin console.

> Status: functional MVP on Postgres: your Supabase database in production, an embedded Postgres (PGlite) with demo data locally. Payment-gateway adapters are prepared but not connected. See [What is not live yet](#what-is-not-live-yet).

---

## Quick start

Requirements: Node.js 20.9+ (tested with Node 26) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed for the demo: without `DATABASE_URL` the app runs on an embedded Postgres (PGlite) built from `supabase/migrations` plus demo data, saved to `.data/pglite`. The very first request takes 15–30 seconds while that database is created; later starts are fast.

For a production build (requires `SESSION_SECRET` in `.env.local`, see below):

```bash
npm run build
npm run start
```

### Deployment (Vercel + Supabase)

`main` deploys automatically to Vercel (project `signalsocietyid-tech/market-in`). Supabase (project `wvaogsqxridvpmquarlv`) is linked to the GitHub repo and applies new files in `supabase/migrations` on push to `main`.

Set these in Vercel → Settings → Environment Variables (Production and Preview):

| Variable | Where to find it |
| --- | --- |
| `SESSION_SECRET` | Any random string of 32+ characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). |
| `DATABASE_URL` | Supabase → **Connect** → *Transaction pooler* connection string (port `6543`), with your database password filled in. |

First-time database setup in Supabase:

1. Check that both migrations are applied (Supabase → Integrations → GitHub, or run them in the SQL Editor in order).
2. Run `supabase/seed.sql` once in the SQL Editor (plans and categories; seed files are never applied automatically).
3. Optional, for demos only: `DATABASE_URL="…" npm run db:demo` loads the fictional marketplace (without an admin account).
4. Admin access: register normally, then run in the SQL Editor: `update public.users set role = 'admin' where email = 'you@example.com';`

### Demo accounts

The login page has one-click **Explore the demo** buttons. On the embedded database all five appear (Business, Sales Partner, Creator, Agency, Admin). On a real database they are hidden unless `ENABLE_DEMO_LOGIN=true`, and the admin demo is never offered there.

| Role | Email | Plan |
| --- | --- | --- |
| Business | `business@marketin.demo` | Business Pro |
| Sales Partner | `sales@marketin.demo` | Sales Free (shows locked Pro features) |
| Creator & Affiliate | `creator@marketin.demo` | Creator Pro |
| Agency | `agency@marketin.demo` | Agency Pro |
| Admin | `admin@marketin.demo` | — |

All seeded accounts share the password in `DEMO_PASSWORD` in [src/lib/data/seed.ts](src/lib/data/seed.ts). All companies, people and figures in the seed are fictional.

**Resetting data:** the embedded database lives in `.data/pglite`. Delete that folder, or use **Admin → Overview → Reset demo data** (embedded database only), to restore the demo data. Demo accounts keep the same IDs across resets.

---

## Implemented features

**Public website**
- Homepage with all 11 sections: hero with an illustrative dashboard preview, user segmentation, marketplace categories, how it works, why MarketIn, a distinct agency section, membership & pricing (monthly/yearly toggle), trust & community with sample profiles, tabbed FAQ, final CTA, footer.
- Sticky navbar with active states and a mobile drawer; full footer. Every footer link resolves to a real page.
- Segment landing pages (`/for-business`, `/for-sales-partners`, `/for-creators`, `/for-agencies`), `/how-it-works`, `/pricing` with plan comparison tables, plus About, Contact, Careers, Partnership, Blog, Insights, Help Center, FAQ, and draft Terms / Privacy / Cookie policy.

**Accounts & onboarding**
- `/register`: choose one of four account types, then a multi-step onboarding form specific to that type (React Hook Form + Zod, per-step validation). Business logo upload included. Supports `?type=` preselection and `?plan=` → continues to checkout.
- `/login`, `/forgot-password` (no email is sent yet), password change in `/settings`. Password hashes (scrypt) are stored in `user_credentials`.
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
    db/                Postgres client (Supabase or embedded PGlite), table mappings, demo-data loader
    data/              Read queries, dashboard insights, seed content
    actions/           Server actions: auth, marketplace, account/billing, admin
    payments/          Payment provider interface (mock, Midtrans/Xendit stubs)
    supabase/          Supabase JS clients (reserved for Supabase Auth/Storage; not used yet)
supabase/
  migrations/0001_init.sql   Full Postgres schema with row-level security
  migrations/0002_*.sql      App-managed credentials; closes the public API (server-only access)
  seed.sql                   Plans and taxonomies
docs/
  ARCHITECTURE.md      Decisions, data flow, database access
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
| `DATABASE_URL` | **yes in production** | Postgres connection string. Use Supabase's transaction pooler URL on Vercel. Without it the app uses the embedded demo database. |
| `ENABLE_DEMO_LOGIN` | no | `true` shows the non-admin demo logins on a real database (only after `npm run db:demo`). |
| `MOCK_DB_PERSIST` | no | `false` keeps the embedded database in memory instead of `.data/pglite`. Always in memory on Vercel. |
| `SESSION_SECRET` | **yes in production** | 32+ random characters used to sign the session cookie. In production (`npm run start`, Vercel) sign-in is disabled until it is set; there is no fallback. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | not yet | Reserved for Supabase Auth and Storage; the app doesn't read them today. |
| `PAYMENT_PROVIDER` | no | `mock` (default), `midtrans` or `xendit`. |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION` | with Midtrans | Midtrans Snap credentials. |
| `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN` | with Xendit | Xendit invoice credentials and webhook token. |

No credentials are committed or invented anywhere in the code.

---

## What is not live yet

- **Accounts:** sign-up and login are handled by the app (scrypt hashes in Postgres plus a signed session cookie), not yet by Supabase Auth, so there are no confirmation or reset emails.
- **Query style:** each request loads the tables it needs and filters in code. That's fine at MVP scale; move hot paths to SQL `where` clauses as data grows.
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

1. **Supabase Auth:** move credentials to Supabase Auth (`signUp` / `signInWithPassword` / `resetPasswordForEmail`) for email confirmation and password reset, restore the `users.id → auth.users` foreign key and drop `user_credentials`. Then push frequent queries down into SQL. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
2. **Payments:** implement the Midtrans Snap or Xendit Invoice adapter and the signed webhook ([docs/PAYMENTS.md](docs/PAYMENTS.md)), then retire manual activation for paid flows.
3. **Messaging:** a business ↔ partner conversation thread per application (the "communicate & negotiate" step).
4. **Transactional email:** application updates, invitations and password reset (e.g. Resend or Postmark via Supabase SMTP).
5. **Social verification:** OAuth connections for Instagram, TikTok and YouTube to verify follower counts and engagement.
6. **File storage:** logos, portfolios and verification documents in Supabase Storage instead of data URLs.
7. **Tracking:** affiliate link and voucher tracking so partnership metrics are measured, not reported.
8. **Testing & ops:** `npm run test:db` checks the schema and data mapping on both database drivers; add Playwright end-to-end tests for the role journeys, error monitoring, rate limiting on auth and server actions.
9. **Localization:** Bahasa Indonesia UI (the copy lives in `src/content/` and components).
10. **Legal review** of the Terms, Privacy (UU PDP No. 27/2022) and Cookie policy before launch.

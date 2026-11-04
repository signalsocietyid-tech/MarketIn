-- MarketIn initial schema for Supabase (Postgres 15+).
-- Mirrors src/lib/types.ts. Auth users live in auth.users; public.users holds
-- the marketplace account (role, status, verification) keyed by the same id.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums ----
create type account_role as enum ('business', 'sales', 'creator', 'agency', 'admin');
create type account_status as enum ('active', 'suspended', 'flagged');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type market_category as enum ('sales', 'affiliate', 'kol', 'agency');
create type opportunity_type as enum (
  'sales_representative', 'distributor_partnership', 'sales_agent', 'b2b_sales_outsourcing',
  'affiliate_campaign', 'reseller_partnership', 'kol_campaign', 'ugc_collaboration',
  'product_review', 'agency_partnership'
);
create type compensation_model as enum ('fixed_fee', 'commission', 'fixed_plus_commission', 'revenue_sharing', 'negotiable');
create type opportunity_status as enum ('open', 'paused', 'closed');
create type experience_level as enum ('any', 'junior', 'mid', 'senior');
create type application_status as enum ('pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'completed');
create type partnership_status as enum ('active', 'paused', 'completed');
create type plan_tier as enum ('free', 'pro');
create type billing_cycle as enum ('monthly', 'yearly');
create type subscription_status as enum ('active', 'pending_payment', 'canceled', 'expired');
create type talent_type as enum ('sales', 'creator', 'affiliate');
create type talent_status as enum ('available', 'on_project', 'inactive');
create type category_kind as enum ('industry', 'niche', 'location');

-- ------------------------------------------------------------- accounts ----
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role account_role not null,
  name text not null,
  status account_status not null default 'active',
  verification verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table public.businesses (
  user_id uuid primary key references public.users (id) on delete cascade,
  company_name text not null,
  business_email text not null,
  industry text not null,
  category text not null,
  location text not null,
  website text,
  description text not null,
  logo_url text,
  company_size text
);

create table public.sales_partners (
  user_id uuid primary key references public.users (id) on delete cascade,
  full_name text not null,
  title text not null,
  location text not null,
  industries text[] not null default '{}',
  experience_years int not null default 0 check (experience_years >= 0),
  partnership_types text[] not null default '{}',
  areas text[] not null default '{}',
  specializations text[] not null default '{}',
  portfolio text not null default '',
  bio text not null default ''
);

create table public.creators (
  user_id uuid primary key references public.users (id) on delete cascade,
  full_name text not null,
  creator_types text[] not null default '{}',
  engagement_rate numeric(5, 2) check (engagement_rate between 0 and 100),
  niches text[] not null default '{}',
  location text not null,
  portfolio text not null default '',
  collaboration_types text[] not null default '{}',
  bio text not null default ''
);

create table public.creator_socials (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (user_id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'x', 'linkedin', 'facebook')),
  handle text not null,
  url text not null,
  followers int not null default 0 check (followers >= 0),
  verified_at timestamptz,
  unique (creator_id, platform)
);

create table public.agencies (
  user_id uuid primary key references public.users (id) on delete cascade,
  agency_name text not null,
  category text not null,
  website text,
  location text not null,
  description text not null,
  services text[] not null default '{}',
  team_size text not null,
  portfolio text not null default ''
);

create table public.talents (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (user_id) on delete cascade,
  name text not null,
  type talent_type not null,
  specialty text not null,
  location text not null,
  followers int,
  status talent_status not null default 'available',
  added_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (user_id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  name text not null,
  email text not null,
  role text not null check (role in ('owner', 'manager', 'member')),
  status text not null default 'invited' check (status in ('active', 'invited')),
  invited_at timestamptz not null default now(),
  unique (agency_id, email)
);

-- --------------------------------------------------------- marketplace ----
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (user_id) on delete cascade,
  title text not null,
  company_name text not null,
  type opportunity_type not null,
  category market_category not null,
  industry text not null,
  location text not null,
  remote boolean not null default false,
  description text not null,
  requirements text[] not null default '{}',
  deliverables text[] not null default '{}',
  compensation_model compensation_model not null,
  compensation_detail text not null,
  budget_min bigint check (budget_min >= 0),
  budget_max bigint check (budget_max >= 0),
  experience_level experience_level not null default 'any',
  platforms text[] not null default '{}',
  deadline timestamptz not null,
  duration text not null,
  status opportunity_status not null default 'open',
  premium boolean not null default false,
  featured boolean not null default false,
  flagged boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  check (budget_max is null or budget_min is null or budget_max >= budget_min)
);
create index opportunities_browse_idx on public.opportunities (category, status, created_at desc);
create index opportunities_business_idx on public.opportunities (business_id);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  applicant_id uuid not null references public.users (id) on delete cascade,
  talent_id uuid references public.talents (id) on delete set null,
  message text not null,
  proposed_rate text,
  status application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index applications_unique_idx on public.applications (opportunity_id, applicant_id, coalesce(talent_id, '00000000-0000-0000-0000-000000000000'));
create index applications_applicant_idx on public.applications (applicant_id);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  application_id uuid not null unique references public.applications (id) on delete cascade,
  business_id uuid not null references public.users (id) on delete cascade,
  partner_id uuid not null references public.users (id) on delete cascade,
  status partnership_status not null default 'active',
  start_date timestamptz not null default now(),
  end_date timestamptz,
  leads int not null default 0,
  conversions int not null default 0,
  revenue bigint not null default 0,
  content_pieces int not null default 0,
  reach bigint not null default 0
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.users (id) on delete cascade,
  reviewee_id uuid not null references public.users (id) on delete cascade,
  partnership_id uuid references public.partnerships (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  unique (partnership_id, reviewer_id)
);

create table public.saved_items (
  user_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('opportunity', 'profile')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('user', 'opportunity')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind category_kind not null,
  name text not null,
  active boolean not null default true,
  unique (kind, name)
);

-- -------------------------------------------------------- subscriptions ----
create table public.subscription_plans (
  id text primary key, -- e.g. plan_business_pro
  segment account_role not null check (segment <> 'admin'),
  tier plan_tier not null,
  name text not null,
  tagline text not null default '',
  price_monthly bigint not null check (price_monthly >= 0),
  price_yearly bigint not null check (price_yearly >= 0),
  benefits text[] not null default '{}',
  entitlements text[] not null default '{}',
  limits jsonb not null default '{}'::jsonb,
  recommended boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0
);

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  billing_cycle billing_cycle not null,
  status subscription_status not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now()
);
create unique index one_live_subscription_idx on public.user_subscriptions (user_id) where status = 'active';
create unique index one_pending_subscription_idx on public.user_subscriptions (user_id) where status = 'pending_payment';

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  action text not null check (action in ('started', 'upgrade_requested', 'activated', 'downgraded', 'canceled', 'resumed')),
  billing_cycle billing_cycle not null,
  amount bigint not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------- helper functions ----
create or replace function public.current_role() returns account_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false)
$$;

-- ------------------------------------------------- row level security ----
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.sales_partners enable row level security;
alter table public.creators enable row level security;
alter table public.creator_socials enable row level security;
alter table public.agencies enable row level security;
alter table public.talents enable row level security;
alter table public.team_members enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.partnerships enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_items enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.categories enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.subscription_events enable row level security;

-- Public profile data is readable by everyone (non-suspended accounts); owners edit their own rows.
create policy "public profiles readable" on public.users for select using (status <> 'suspended' or id = auth.uid() or public.is_admin());
create policy "admin manages users" on public.users for update using (public.is_admin());

create policy "read businesses" on public.businesses for select using (true);
create policy "own business" on public.businesses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read sales partners" on public.sales_partners for select using (true);
create policy "own sales profile" on public.sales_partners for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read creators" on public.creators for select using (true);
create policy "own creator profile" on public.creators for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read socials" on public.creator_socials for select using (true);
create policy "own socials" on public.creator_socials for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "read agencies" on public.agencies for select using (true);
create policy "own agency" on public.agencies for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "agency talents" on public.talents for all using (agency_id = auth.uid() or public.is_admin()) with check (agency_id = auth.uid());
create policy "talents public read" on public.talents for select using (true);
create policy "agency team" on public.team_members for all using (agency_id = auth.uid() or user_id = auth.uid() or public.is_admin()) with check (agency_id = auth.uid());

create policy "browse open opportunities" on public.opportunities for select
  using ((status = 'open' and not flagged) or business_id = auth.uid() or public.is_admin());
create policy "business writes own opportunities" on public.opportunities for insert
  with check (business_id = auth.uid() and public.current_role() = 'business');
create policy "business updates own opportunities" on public.opportunities for update
  using (business_id = auth.uid() or public.is_admin());

create policy "applicant or owner reads application" on public.applications for select using (
  applicant_id = auth.uid()
  or exists (select 1 from public.opportunities o where o.id = opportunity_id and o.business_id = auth.uid())
  or public.is_admin()
);
create policy "partners apply" on public.applications for insert
  with check (applicant_id = auth.uid() and public.current_role() in ('sales', 'creator', 'agency'));
create policy "owner updates status" on public.applications for update using (
  exists (select 1 from public.opportunities o where o.id = opportunity_id and o.business_id = auth.uid()) or public.is_admin()
);
create policy "applicant withdraws" on public.applications for delete
  using (applicant_id = auth.uid() and status in ('pending', 'under_review'));

create policy "parties read partnership" on public.partnerships for select using (business_id = auth.uid() or partner_id = auth.uid() or public.is_admin());
create policy "parties update partnership" on public.partnerships for update using (business_id = auth.uid() or partner_id = auth.uid());

create policy "reviews public" on public.reviews for select using (true);
create policy "party reviews partnership" on public.reviews for insert with check (
  reviewer_id = auth.uid()
  and exists (select 1 from public.partnerships p where p.id = partnership_id and auth.uid() in (p.business_id, p.partner_id))
);

create policy "own saved items" on public.saved_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications for update using (user_id = auth.uid());

create policy "file report" on public.reports for insert with check (reporter_id = auth.uid());
create policy "admin reads reports" on public.reports for select using (public.is_admin() or reporter_id = auth.uid());
create policy "admin resolves reports" on public.reports for update using (public.is_admin());

create policy "categories public" on public.categories for select using (true);
create policy "admin categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "plans public" on public.subscription_plans for select using (active or public.is_admin());
create policy "admin plans" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());

-- Subscriptions are only written server-side (service role) after payment confirmation.
create policy "own subscriptions" on public.user_subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "own subscription events" on public.subscription_events for select using (user_id = auth.uid() or public.is_admin());

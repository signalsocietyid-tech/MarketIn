-- MarketIn: credentials stored by the app, and server-only database access.
--
-- The app reads and writes Postgres from the server (Next.js) using a direct
-- connection, and enforces authorization in code. Accounts are created by the
-- app rather than Supabase Auth for now, so public.users no longer references
-- auth.users. Moving credentials to Supabase Auth later only needs this
-- foreign key restored and user_credentials dropped.

alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column id set default gen_random_uuid();

create table if not exists public.user_credentials (
  user_id uuid primary key references public.users (id) on delete cascade,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: password hashes are never readable through the API.
alter table public.user_credentials enable row level security;

-- Nothing in the app uses the public (anon) API yet, so close it entirely.
-- The RLS policies from 0001 stay in place for when client-side access is added.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

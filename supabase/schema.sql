-- ============================================================================
-- The Farm 1893 — full database schema (single file).
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste ALL of this →
-- Run. You should see "Success. No rows returned." Safe to run more than once.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---- enums (guarded so re-runs don't error) --------------------------------
do $$ begin create type lead_stage as enum ('new','toured','proposal','booked','lost'); exception when duplicate_object then null; end $$;
do $$ begin create type lead_priority as enum ('hot','warm','nurture'); exception when duplicate_object then null; end $$;
do $$ begin create type event_status as enum ('tour','tentative','confirmed','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type message_channel as enum ('web_chat','phone','email','sms'); exception when duplicate_object then null; end $$;
do $$ begin create type message_role as enum ('inbound','outbound','ai'); exception when duplicate_object then null; end $$;

-- ---- contacts --------------------------------------------------------------
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_email_idx on contacts (email);

-- ---- leads (with richer intake) --------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  name text not null,
  email text,
  phone text,
  event_type text default 'Wedding',
  event_date date,
  guest_count int,
  budget text,
  message text,
  source text default 'website',
  heard_about text,
  style text,
  segment text default 'wedding',
  stage lead_stage not null default 'new',
  score int default 50,
  ai_priority lead_priority default 'warm',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_stage_idx on leads (stage);
create index if not exists leads_segment_idx on leads (segment);
create index if not exists leads_event_date_idx on leads (event_date);

-- ---- events / bookings -----------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  event_type text default 'wedding',
  event_date date not null,
  end_date date,
  status event_status not null default 'tentative',
  package text,
  guest_count int,
  total_value numeric,
  deposit_paid numeric default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists events_date_idx on events (event_date);

-- ---- tasks -----------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  done boolean not null default false,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- messages --------------------------------------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  channel message_channel not null default 'web_chat',
  role message_role not null,
  body text not null,
  ai_intent text,
  created_at timestamptz not null default now()
);

-- ---- payments --------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  amount numeric not null,
  status text default 'pending',
  stripe_id text,
  created_at timestamptz not null default now()
);

-- ---- marketing content -----------------------------------------------------
create table if not exists marketing_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  topic text,
  body text not null,
  platform text,
  scheduled_at timestamptz,
  status text default 'draft',
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- AI insights -----------------------------------------------------------
create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  tone text,
  icon text,
  title text not null,
  body text,
  action_url text,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- vendors ---------------------------------------------------------------
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  tier text default 'listed',
  status text default 'pending',
  commission_rate numeric default 0,
  membership_fee numeric default 0,
  contact_email text,
  created_at timestamptz not null default now()
);

-- ---- silo stays (VRBO) -----------------------------------------------------
create table if not exists silo_guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  silo text,
  check_in date,
  nights int default 1,
  total numeric default 0,
  status text default 'upcoming',
  repeat boolean default false,
  created_at timestamptz not null default now()
);

-- ---- lodging assignments (room/silo split) ---------------------------------
create table if not exists room_assignments (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  unit_name text not null,
  unit_type text default 'farmhouse',
  price numeric default 0,
  covered_by text default 'couple',
  guest_name text,
  paid boolean default false,
  created_at timestamptz not null default now()
);

-- ---- registry contributions ------------------------------------------------
create table if not exists registry_contributions (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  fund_id text not null,
  giver_name text,
  amount numeric not null,
  created_at timestamptz not null default now()
);

-- ---- contracts -------------------------------------------------------------
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  client_name text not null,
  event_type text,
  event_date date,
  value numeric default 0,
  status text default 'draft',
  deposit numeric default 0,
  deposit_paid boolean default false,
  created_at timestamptz not null default now()
);

-- ---- dossiers (per-client vendor team / payments / checklist as JSONB) -----
create table if not exists dossiers (
  lead_id uuid primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---- silo listings (seller-editable pricing/photos/reviews as JSONB) --------
create table if not exists silo_listings (
  slug text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---- updated_at trigger ----------------------------------------------------
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads for each row execute function touch_updated_at();

drop trigger if exists contacts_touch on contacts;
create trigger contacts_touch before update on contacts for each row execute function touch_updated_at();

-- ---- Row-Level Security: authenticated staff get full access ---------------
-- Public form submissions go through the app's service-role key (bypasses RLS),
-- so guest data stays private by default.
do $$
declare t text;
begin
  foreach t in array array[
    'contacts','leads','events','tasks','messages','payments',
    'marketing_content','ai_insights','vendors','silo_guests',
    'room_assignments','registry_contributions','contracts',
    'dossiers','silo_listings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "staff full access" on public.%I;', t);
    execute format('create policy "staff full access" on public.%I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ---- Storage: allow LISTING the public `photos` bucket ----------------------
-- (Public buckets are downloadable by anyone, but listing folder contents needs
--  this policy so the website can enumerate hero/, gallery/, and silos/<slug>/.)
drop policy if exists "Public list photos bucket" on storage.objects;
create policy "Public list photos bucket" on storage.objects
  for select to anon, authenticated using (bucket_id = 'Photos');

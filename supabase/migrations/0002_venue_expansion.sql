-- ============================================================================
-- The Farm 1893 — Venue OS schema (v2 expansion)
-- Adds: richer lead intake, vendor network, silo (VRBO) rentals, lodging
-- assignments, registry contributions, contracts — plus authenticated staff
-- policies so the dashboard works once Supabase Auth is on.
-- Run AFTER 0001_init.sql.
-- ============================================================================

-- ---- Richer lead intake (attribution, style, segment) ----------------------
alter table leads add column if not exists heard_about text;         -- marketing attribution
alter table leads add column if not exists style       text;         -- vibe for catering/design
alter table leads add column if not exists segment     text default 'wedding';
-- budget arrives as a human range ("$10,000–$20,000"); store as text.
alter table leads alter column budget type text using budget::text;
create index if not exists leads_segment_idx on leads (segment);

-- ---- Vendor network --------------------------------------------------------
create table if not exists vendors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  tier            text default 'listed',   -- preferred | featured | listed
  status          text default 'pending',  -- active | pending | review
  commission_rate numeric default 0,
  membership_fee  numeric default 0,
  contact_email   text,
  created_at      timestamptz not null default now()
);

-- ---- Silo Stays (VRBO rentals) ---------------------------------------------
create table if not exists silo_guests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  silo        text,
  check_in    date,
  nights      int default 1,
  total       numeric default 0,
  status      text default 'upcoming',     -- upcoming | staying | past
  repeat      boolean default false,
  created_at  timestamptz not null default now()
);

-- ---- Lodging assignments (room/silo split per wedding) ---------------------
create table if not exists room_assignments (
  id           uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  unit_name    text not null,
  unit_type    text default 'farmhouse',   -- farmhouse | silo
  price        numeric default 0,
  covered_by   text default 'couple',      -- couple | guest | registry
  guest_name   text,
  paid         boolean default false,
  created_at   timestamptz not null default now()
);

-- ---- Registry contributions (gift funds) -----------------------------------
create table if not exists registry_contributions (
  id           uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  fund_id      text not null,
  giver_name   text,
  amount       numeric not null,
  created_at   timestamptz not null default now()
);

-- ---- Contracts & deposits --------------------------------------------------
create table if not exists contracts (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads(id) on delete set null,
  client_name   text not null,
  event_type    text,
  event_date    date,
  value         numeric default 0,
  status        text default 'draft',      -- draft | sent | signed | paid
  deposit       numeric default 0,
  deposit_paid  boolean default false,
  created_at    timestamptz not null default now()
);

alter table vendors                enable row level security;
alter table silo_guests            enable row level security;
alter table room_assignments       enable row level security;
alter table registry_contributions enable row level security;
alter table contracts              enable row level security;

-- ============================================================================
-- Authenticated staff get full access to everything. Public form submissions
-- flow through the app's service-role key (which bypasses RLS), so no anon
-- policies are needed — keeping guest data private by default.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'contacts','leads','events','tasks','messages','payments',
    'marketing_content','ai_insights','vendors','silo_guests',
    'room_assignments','registry_contributions','contracts'
  ]
  loop
    execute format('drop policy if exists "staff full access" on public.%I;', t);
    execute format(
      'create policy "staff full access" on public.%I for all to authenticated using (true) with check (true);',
      t);
  end loop;
end $$;

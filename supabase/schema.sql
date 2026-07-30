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
  signed_at timestamptz,
  signer_ip text,
  signer_name text,
  pdf_path text,
  signature_data text,
  created_at timestamptz not null default now()
);
-- add signing columns if the table pre-dates this migration
alter table contracts add column if not exists signed_at timestamptz;
alter table contracts add column if not exists signer_ip text;
alter table contracts add column if not exists signer_name text;
alter table contracts add column if not exists pdf_path text;
alter table contracts add column if not exists signature_data text;

-- ---- invoices (installments, ACH/card, reminders) -------------------------
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  contract_id uuid references contracts(id) on delete set null,
  label text not null,
  amount numeric not null,
  due_date date,
  status text not null default 'draft',   -- draft | sent | paid | overdue | void
  stripe_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invoices_lead_idx on invoices (lead_id);
create index if not exists invoices_status_idx on invoices (status);

-- ---- payment reminders (dunning schedule) ----------------------------------
create table if not exists payment_reminders (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  send_at timestamptz not null,
  sent_at timestamptz,
  channel text default 'email',
  created_at timestamptz not null default now()
);

-- ---- durable rate limiting (survives serverless cold starts) ---------------
create table if not exists rate_limits (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
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

-- ============================================================================
-- PHASE 1 — Availability & calendar spine
-- One list of bookable resources (the venue + each silo + farmhouse rooms) and
-- the date ranges each is blocked, so one engine can prevent double-booking
-- across weddings and short-term stays.
-- ============================================================================

-- ---- resources (bookable units) --------------------------------------------
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  kind text not null default 'venue',   -- venue | silo | room
  property_id uuid,                      -- multi-property (Phase 6); null = the Farm
  capacity int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists resources_kind_idx on resources (kind);

-- ---- availability blocks (manual holds, iCal/OTA imports, maintenance) ------
create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references resources(id) on delete cascade,
  resource_slug text,                    -- convenience key when resource_id unknown
  start_date date not null,
  end_date date not null,                -- inclusive
  reason text,
  source text not null default 'manual', -- manual | ical | ota
  external_id text,                      -- de-dupe key for imported blocks
  created_at timestamptz not null default now()
);
create index if not exists availability_blocks_range_idx on availability_blocks (start_date, end_date);
create index if not exists availability_blocks_resource_idx on availability_blocks (resource_slug);

-- ============================================================================
-- PHASE 2 — Portals (client / guest / vendor) + auth
-- Membership maps a Supabase auth user to a booking; access_tokens back the
-- zero-account signed links (guest check-in, one-off signing). Messages,
-- documents, seating, and RSVPs power the authenticated planning portal.
-- ============================================================================

-- ---- portal membership (auth user -> booking) ------------------------------
create table if not exists portal_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lead_id uuid references leads(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete cascade,
  role text not null default 'couple',   -- couple | vendor
  created_at timestamptz not null default now()
);
create index if not exists portal_members_user_idx on portal_members (user_id);

-- ---- access tokens (revocation / audit for signed links) -------------------
create table if not exists access_tokens (
  token text primary key,
  subject_type text not null,
  subject_id text not null,
  scope text not null,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---- portal messages (couple <-> staff <-> vendor) -------------------------
create table if not exists portal_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  sender text not null default 'couple',  -- couple | staff | vendor | guest
  body text not null,
  channel text default 'portal',
  created_at timestamptz not null default now()
);
create index if not exists portal_messages_lead_idx on portal_messages (lead_id);

-- ---- documents (private file vault per client) -----------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  name text not null,
  path text,
  kind text default 'other',               -- contract | invoice | insurance | inspiration | other
  uploaded_by text default 'staff',
  created_at timestamptz not null default now()
);
create index if not exists documents_lead_idx on documents (lead_id);

-- ---- seating chart ---------------------------------------------------------
create table if not exists seating_tables (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  label text not null,
  capacity int not null default 8,
  created_at timestamptz not null default now()
);
create table if not exists seating_assignments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references seating_tables(id) on delete cascade,
  guest_name text not null,
  rsvp_id uuid,
  created_at timestamptz not null default now()
);

-- ---- RSVPs (guest responses -> CRM audience) -------------------------------
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  guest_name text not null,
  email text,
  party_size int default 1,
  meal text,
  status text default 'attending',        -- attending | declined | pending
  future_couple boolean default false,     -- opted in as a future-wedding lead
  created_at timestamptz not null default now()
);
create index if not exists rsvps_slug_idx on rsvps (wedding_slug);

-- ============================================================================
-- PHASE 4 — Back-of-house operations (tasks, inventory, maintenance, staff)
-- ============================================================================

-- ---- staff & time-clock ----------------------------------------------------
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  role text,
  permissions text[] not null default '{}',
  hourly_rate numeric default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  event_id uuid references events(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---- operational tasks (distinct from lead-linked `tasks`) ------------------
create table if not exists op_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other',   -- cleaning | setup | lawn | turnover | other
  assignee_staff_id uuid references staff(id) on delete set null,
  assignee_name text,
  event_id uuid references events(id) on delete set null,
  due_at date,
  status text not null default 'todo',       -- todo | in_progress | done
  recurring text,
  created_at timestamptz not null default now()
);
create index if not exists op_tasks_status_idx on op_tasks (status);

-- ---- inventory (low-stock = quantity < par_level) --------------------------
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  quantity int not null default 0,
  par_level int not null default 0,
  unit text default 'units',
  created_at timestamptz not null default now()
);

-- ---- maintenance assets + logs ---------------------------------------------
create table if not exists maintenance_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text default 'other',                 -- hvac | pool | septic | grounds | other
  last_service date,
  next_service date,
  interval_days int default 90,
  created_at timestamptz not null default now()
);
create table if not exists maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references maintenance_assets(id) on delete cascade,
  note text,
  cost numeric default 0,
  serviced_at timestamptz not null default now()
);

-- ============================================================================
-- PHASE 5 — Communications, integrations & growth
-- ============================================================================

-- extend the message-channel enum for OTA inboxes (guarded)
do $$ begin alter type message_channel add value if not exists 'airbnb'; exception when others then null; end $$;
do $$ begin alter type message_channel add value if not exists 'vrbo'; exception when others then null; end $$;

-- ---- unified inbox conversations -------------------------------------------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  name text,
  channel text not null default 'email',   -- email | sms | web_chat | airbnb | vrbo | facebook
  external_id text,
  last_at timestamptz not null default now(),
  unread boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists conversations_channel_idx on conversations (channel);

-- ---- reviews (aggregated) + requests ---------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- google | airbnb | vrbo | facebook | the-knot
  author text,
  rating int,
  body text,
  event_id uuid references events(id) on delete set null,
  review_date date,
  created_at timestamptz not null default now()
);
create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  channel text default 'email',
  sent_at timestamptz,
  responded boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- coupons / promo codes -------------------------------------------------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null default 'percent',    -- percent | amount
  amount numeric not null default 0,
  expires_at date,
  uses int not null default 0,
  max_uses int not null default 0,          -- 0 = unlimited
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- automations (trigger -> action) ---------------------------------------
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text not null,
  condition jsonb default '{}',
  action text not null,
  active boolean not null default true,
  runs int not null default 0,
  created_at timestamptz not null default now()
);

-- ---- external calendar connections (OAuth tokens / iCal feeds) -------------
create table if not exists calendar_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null,                  -- google | outlook | apple | airbnb | vrbo
  account text,
  tokens jsonb default '{}',
  ical_url text,
  resource_id uuid references resources(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PHASE 6 — Multi-property support
-- A property entity plus NULLABLE property_id columns on the resources that can
-- belong to more than one location. Additive & nullable = non-breaking; a
-- single-venue install simply leaves them null (defaults to The Farm 1893).
-- ============================================================================
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table resources           add column if not exists property_id uuid references properties(id) on delete set null;
alter table events              add column if not exists property_id uuid references properties(id) on delete set null;
alter table op_tasks            add column if not exists property_id uuid references properties(id) on delete set null;
alter table inventory_items     add column if not exists property_id uuid references properties(id) on delete set null;
alter table maintenance_assets  add column if not exists property_id uuid references properties(id) on delete set null;
alter table staff               add column if not exists property_id uuid references properties(id) on delete set null;

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
    'dossiers','silo_listings','resources','availability_blocks',
    'portal_members','access_tokens','portal_messages','documents',
    'seating_tables','seating_assignments','rsvps',
    'invoices','payment_reminders','rate_limits',
    'staff','time_entries','op_tasks','inventory_items',
    'maintenance_assets','maintenance_logs',
    'conversations','reviews','review_requests','coupons',
    'automations','calendar_connections','properties'
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

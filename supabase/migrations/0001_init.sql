-- ============================================================================
-- The Farm 1893 — Venue OS schema (v1)
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
-- Designed for the AI-powered CRM: leads, contacts, events, tasks, messages,
-- payments, marketing, and AI-conversation logging.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---- Contacts: a person, deduplicated across inquiries ----------------------
create table if not exists contacts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists contacts_email_idx on contacts (email);

-- ---- Leads: an inquiry / opportunity in the pipeline ------------------------
create type lead_stage as enum ('new','toured','proposal','booked','lost');
create type lead_priority as enum ('hot','warm','nurture');

create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  contact_id    uuid references contacts(id) on delete set null,
  name          text not null,
  email         text,
  phone         text,
  event_type    text default 'wedding',
  event_date    date,
  guest_count   int,
  budget        numeric,
  message       text,
  source        text default 'website',
  stage         lead_stage not null default 'new',
  score         int default 50,           -- AI lead score 0-100
  ai_priority   lead_priority default 'warm',
  ai_summary    text,                      -- AI next-best-action
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists leads_stage_idx on leads (stage);
create index if not exists leads_event_date_idx on leads (event_date);

-- ---- Events / Bookings: a scheduled use of the venue -----------------------
create type event_status as enum ('tour','tentative','confirmed','completed','cancelled');

create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads(id) on delete set null,
  contact_id    uuid references contacts(id) on delete set null,
  title         text not null,
  event_type    text default 'wedding',
  event_date    date not null,
  end_date      date,                      -- for multi-day weekend packages
  status        event_status not null default 'tentative',
  package       text,
  guest_count   int,
  total_value   numeric,
  deposit_paid  numeric default 0,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists events_date_idx on events (event_date);
create index if not exists events_status_idx on events (status);

-- ---- Tasks: follow-ups, often AI-generated ---------------------------------
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade,
  title       text not null,
  due_at      timestamptz,
  done        boolean not null default false,
  ai_generated boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---- Messages: unified inbox (email, chat, AI receptionist) -----------------
create type message_channel as enum ('web_chat','phone','email','sms');
create type message_role as enum ('inbound','outbound','ai');

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade,
  channel     message_channel not null default 'web_chat',
  role        message_role not null,
  body        text not null,
  ai_intent   text,                        -- classified intent
  created_at  timestamptz not null default now()
);
create index if not exists messages_lead_idx on messages (lead_id);

-- ---- Payments: deposits & invoices (Stripe) --------------------------------
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references events(id) on delete set null,
  amount        numeric not null,
  status        text default 'pending',    -- pending | paid | refunded
  stripe_id     text,
  created_at    timestamptz not null default now()
);

-- ---- Marketing content: generated posts & campaigns ------------------------
create table if not exists marketing_content (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null,              -- instagram | email | ad | blog
  topic        text,
  body         text not null,
  platform     text,
  scheduled_at timestamptz,
  status       text default 'draft',       -- draft | scheduled | published
  ai_generated boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---- AI insights: dashboard recommendations --------------------------------
create table if not exists ai_insights (
  id          uuid primary key default gen_random_uuid(),
  tone        text,
  icon        text,
  title       text not null,
  body        text,
  action_url  text,
  dismissed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---- updated_at trigger ----------------------------------------------------
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads
  for each row execute function touch_updated_at();

drop trigger if exists contacts_touch on contacts;
create trigger contacts_touch before update on contacts
  for each row execute function touch_updated_at();

-- ---- Row Level Security ----------------------------------------------------
-- The public website inserts leads via the service role (server-side), which
-- bypasses RLS. Enable RLS so nothing is readable by the anon key by default;
-- add authenticated staff policies when you wire up Supabase Auth.
alter table contacts          enable row level security;
alter table leads             enable row level security;
alter table events            enable row level security;
alter table tasks             enable row level security;
alter table messages          enable row level security;
alter table payments          enable row level security;
alter table marketing_content enable row level security;
alter table ai_insights       enable row level security;

-- Example staff policy (uncomment once auth is set up):
-- create policy "staff read leads" on leads for select
--   to authenticated using (true);

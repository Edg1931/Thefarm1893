-- ============================================================================
-- PHASE 7 DELTA — turnover, expenses, and billable fees
--
-- Convenience file: paste this whole thing into the Supabase SQL editor and
-- press Run. It's the only new SQL since the last time schema.sql / seed.sql
-- were applied.
--
-- Equivalent alternative: re-run supabase/schema.sql then supabase/seed.sql in
-- full. Both are idempotent, so nothing is duplicated or overwritten — this
-- file just saves you pasting ~700 lines you've already run.
--
-- Safe to run more than once (create table if not exists / insert-where-not-
-- exists throughout). No existing data is touched.
-- ============================================================================

-- ---- turnover / housekeeping -----------------------------------------------
-- A single clean of one unit. `expected_minutes` carries the benchmark so
-- actual-vs-expected (and therefore cost-per-clean) is a plain subtraction.
create table if not exists turnovers (
  id uuid primary key default gen_random_uuid(),
  resource_slug text not null,               -- venue | the-orchard-silo | ...
  unit_kind text not null default 'silo',    -- silo | bridal_barn | main_venue | farmhouse
  event_id uuid references events(id) on delete set null,
  scheduled_for date,
  status text not null default 'scheduled',  -- scheduled | in_progress | done | flagged
  cleaner_staff_id uuid references staff(id) on delete set null,
  cleaner_name text,
  hourly_rate numeric,                       -- rate used for THIS clean
  expected_minutes int,                      -- benchmark for the unit kind
  started_at timestamptz,
  finished_at timestamptz,
  actual_minutes int,                        -- computed on completion
  cost numeric,                              -- actual_minutes/60 * hourly_rate
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists turnovers_status_idx on turnovers (status);
create index if not exists turnovers_date_idx on turnovers (scheduled_for);

-- ---- per-turnover checklist (stocking / staging / cleaning) ----------------
create table if not exists turnover_tasks (
  id uuid primary key default gen_random_uuid(),
  turnover_id uuid references turnovers(id) on delete cascade,
  label text not null,
  category text default 'cleaning',          -- cleaning | staging | stocking | inspect
  done boolean not null default false,
  sort_order int default 0
);

-- ---- before / after photos + damage & missing-item reports -----------------
create table if not exists turnover_photos (
  id uuid primary key default gen_random_uuid(),
  turnover_id uuid references turnovers(id) on delete cascade,
  phase text not null default 'before',      -- before | after | damage
  path text not null,
  caption text,
  created_at timestamptz not null default now()
);
create table if not exists turnover_issues (
  id uuid primary key default gen_random_uuid(),
  turnover_id uuid references turnovers(id) on delete cascade,
  kind text not null default 'damage',       -- damage | missing | maintenance
  description text not null,
  est_cost numeric default 0,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- expenses (the accounting-cost reduction) ------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  incurred_on date not null default current_date,
  category text not null default 'other',    -- cleaning | maintenance | supplies | payroll | marketing | utilities | insurance | other
  vendor text,
  description text,
  amount numeric not null,
  event_id uuid references events(id) on delete set null,
  turnover_id uuid references turnovers(id) on delete set null,
  receipt_path text,                          -- private `documents` bucket
  tax_deductible boolean not null default true,
  property_id uuid references properties(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists expenses_date_idx on expenses (incurred_on);
create index if not exists expenses_category_idx on expenses (category);

-- ---- billable fee schedule + charges ---------------------------------------
-- The rates live in the DB so the owner can change them without a deploy.
create table if not exists fee_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- outside_vendor | late_checkout | extra_walkthrough
  label text not null,
  amount numeric not null default 0,
  unit text default 'flat',                  -- flat | hour
  grace_minutes int default 0,
  active boolean not null default true,
  notes text
);
create table if not exists fee_charges (
  id uuid primary key default gen_random_uuid(),
  fee_code text not null,
  lead_id uuid references leads(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  quantity numeric not null default 1,
  amount numeric not null,                   -- resolved at time of charge
  reason text,
  invoice_id uuid references invoices(id) on delete set null,
  waived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fee_charges_event_idx on fee_charges (event_id);


-- ---- Row Level Security for the seven new tables ---------------------------
-- Same treatment as the other 40: denied to anon, full access to a signed-in
-- staff user. The server routes use the service-role key and bypass RLS.
do $$
declare t text;
begin
  foreach t in array array[
    'turnovers','turnover_tasks','turnover_photos','turnover_issues',
    'expenses','fee_types','fee_charges'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "staff full access" on public.%I;', t);
    execute format('create policy "staff full access" on public.%I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ---- billable fee schedule -------------------------------------------------
-- The rates the venue is entitled to charge but most often forgets. They live
-- in the database (not in code) so they can be changed from Dashboard → Money →
-- Billable Fees without a redeploy. `grace_minutes` is the slack given before a
-- late checkout starts billing.
insert into fee_types (code, label, amount, unit, grace_minutes, active, notes)
select v.code, v.label, v.amount, v.unit, v.grace_minutes, v.active, v.notes
from (values
  ('outside_vendor',    'Outside vendor fee',      350, 'flat',  0,  true,
   'Charged when a couple books a caterer or bar service off the preferred list ($200-500 depending on scope).'),
  ('late_checkout',     'Late checkout / overtime',120, 'hour',  15, true,
   'Applies after a 15-minute grace window, then bills by the hour.'),
  ('extra_walkthrough', 'Additional walkthrough',  120, 'hour',  0,  true,
   'Package includes one planning walkthrough; additional site visits bill hourly.')
) as v(code, label, amount, unit, grace_minutes, active, notes)
where not exists (select 1 from fee_types f where f.code = v.code);

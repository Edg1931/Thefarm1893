-- ============================================================================
-- The Farm 1893 — SEED DATA (run AFTER schema.sql, once)
-- Supabase → SQL Editor → New query → paste ALL of this → Run.
-- Safe to re-run: every insert is guarded, so it will not duplicate rows.
--
-- This gives LIVE mode the baseline rows it needs. Without these, the calendar
-- and availability engine have nothing to work against once the keys are added.
-- ============================================================================

-- ---- the property (multi-property support defaults to this one) ------------
insert into properties (name, address, active)
select 'The Farm 1893', '12316 Berlin Road, Berlin Heights, OH 44814', true
where not exists (select 1 from properties where name = 'The Farm 1893');

-- ---- bookable resources: the venue + each silo -----------------------------
-- IMPORTANT: `slug` must match what the app uses. 'venue' is the main venue and
-- the silo slugs come from lib/silos.ts. lib/services/availability.ts keys off
-- these values via availability_blocks.resource_slug.
with p as (select id from properties where name = 'The Farm 1893' limit 1)
insert into resources (name, slug, kind, capacity, active, property_id)
select v.name, v.slug, v.kind, v.capacity, true, p.id
from (values
  ('The Farm (main venue)', 'venue',            'venue', 250),
  ('The Orchard Silo',      'the-orchard-silo', 'silo',    4),
  ('The Harvest Silo',      'the-harvest-silo', 'silo',    4),
  ('The Copper Silo',       'the-copper-silo',  'silo',    2),
  ('The Meadow Silo',       'the-meadow-silo',  'silo',    6)
) as v(name, slug, kind, capacity)
cross join p
where not exists (select 1 from resources r where r.slug = v.slug);

-- ---- starter inventory (edit quantities to your real counts) ---------------
insert into inventory_items (name, category, quantity, par_level, unit)
select v.name, v.category, v.quantity, v.par_level, v.unit
from (values
  ('Wooden farm tables (8ft)', 'Furniture', 26, 24, 'tables'),
  ('Cross-back chairs',        'Furniture', 220, 220, 'chairs'),
  ('Ivory table linens',       'Linens',     30,  30, 'linens'),
  ('Cloth napkins',            'Linens',    240, 220, 'napkins'),
  ('String-light strands',     'Decor',      40,  30, 'strands')
) as v(name, category, quantity, par_level, unit)
where not exists (select 1 from inventory_items i where i.name = v.name);

-- ---- maintenance assets (edit to your real service schedule) ---------------
insert into maintenance_assets (name, kind, last_service, next_service, interval_days)
select v.name, v.kind, current_date, current_date + v.interval_days, v.interval_days
from (values
  ('Barn HVAC - main',   'hvac',    120),
  ('Farmhouse septic',   'septic',  365),
  ('Pool / hot tub',     'pool',     14),
  ('Orchard irrigation', 'grounds',  60)
) as v(name, kind, interval_days)
where not exists (select 1 from maintenance_assets m where m.name = v.name);

-- ---- automation rules (these fire once email/SMS keys are added) -----------
insert into automations (name, trigger, action, active)
select v.name, v.trigger, v.action, v.active
from (values
  ('New-lead welcome',           'lead.created',      'email:welcome',        true),
  ('Toured, not booked (3d)',    'tour.completed+3d', 'email:nudge',          true),
  ('Post-stay review request',   'stay.checkout+3d',  'email:review-request', true),
  ('Balance reminder (14d out)', 'invoice.due-14d',   'email:reminder',       true)
) as v(name, trigger, action, active)
where not exists (select 1 from automations a where a.name = v.name);

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


-- ============================================================================
-- AFTER RUNNING THIS — three manual steps
-- ============================================================================
--
-- 1. STORAGE BUCKET (if you haven't already)
--    Storage → New bucket → name it exactly `documents` → leave it PRIVATE.
--    (Portal/contract/insurance uploads use signed URLs against this bucket.)
--
-- 2. CREATE STAFF LOGINS
--    Authentication → Users → Add user → enable "Auto Confirm".
--    Copy the new user's UUID, then run (one per staff member):
--
--      insert into staff (user_id, name, role, permissions, hourly_rate, active)
--      values ('PASTE-AUTH-USER-UUID', 'Rachel', 'Owner', '{all}', 0, true);
--
--    Permissions are a text array, e.g. '{operations,bookings}' for a lead, or
--    '{all}' for an owner.
--
-- 3. LINK A COUPLE TO THEIR PLANNING PORTAL (optional)
--    Easiest path: Dashboard → Client Portal → "Copy secure portal link".
--    That mints a signed link that needs NO account.
--
--    If you'd rather they sign in with email (magic link), have them sign in
--    once at /portal/signin, then bind their auth user to the booking:
--
--      insert into portal_members (user_id, lead_id, role)
--      values ('THEIR-AUTH-USER-UUID', 'THEIR-LEAD-UUID', 'couple');
--
-- ============================================================================
-- VERIFY IT WORKED
--   select slug, kind from resources order by kind, slug;   -- expect 5 rows
--   select name, active from automations;                   -- expect 4 rows
--   select code, amount, unit from fee_types order by code; -- expect 3 rows
-- Then open Dashboard → Integrations: the health panel should turn green.
-- ============================================================================

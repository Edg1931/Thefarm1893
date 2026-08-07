-- ============================================================================
-- REMOVE DEMO DATA — run this before going live.
--
-- Every row inserted by demo-data.sql has an id beginning `dddd`. This deletes
-- exactly those and nothing else, so real enquiries, bookings, and payments
-- taken during the demo period survive untouched.
--
-- Children are deleted before parents so nothing trips a foreign key. Safe to
-- run more than once, and safe to run if the demo data was never loaded.
-- ============================================================================

begin;

delete from rsvps            where id::text like 'dddd%';
delete from seating_tables   where id::text like 'dddd%';
delete from documents        where id::text like 'dddd%';
delete from coupons          where id::text like 'dddd%';
delete from fee_charges      where id::text like 'dddd%';
delete from turnover_issues  where id::text like 'dddd%';
delete from turnover_tasks   where id::text like 'dddd%';
delete from turnover_photos  where turnover_id::text like 'dddd%';
delete from turnovers        where id::text like 'dddd%';
delete from expenses         where id::text like 'dddd%';
delete from inventory_items  where id::text like 'dddd%';
delete from op_tasks         where id::text like 'dddd%';
delete from reviews          where id::text like 'dddd%';
delete from vendors          where id::text like 'dddd%';
delete from silo_guests      where id::text like 'dddd%';
delete from messages         where id::text like 'dddd%';
delete from conversations    where id::text like 'dddd%';
delete from contracts        where id::text like 'dddd%';
delete from invoices         where id::text like 'dddd%';
delete from payments         where id::text like 'dddd%';
delete from events           where id::text like 'dddd%';
delete from leads            where id::text like 'dddd%';
delete from contacts         where id::text like 'dddd%';

commit;

-- Confirm nothing demo-shaped is left:
--   select count(*) from leads where id::text like 'dddd%';   -- expect 0

-- ============================================================================
-- DEMO DATA — a full walkthrough dataset for showing the client
--
-- Populates every section of the CRM with believable examples so nothing reads
-- as an empty page during a demo, and so anything genuinely broken stands out
-- instead of hiding behind "no data yet".
--
-- HOW TO REMOVE IT AGAIN: every row here uses an id beginning `dddd`. Running
-- supabase/demo-data-remove.sql deletes exactly those rows and nothing else,
-- so real enquiries created during the demo are never touched.
--
-- Safe to re-run: every insert is guarded on its id.
-- Run AFTER schema.sql, seed.sql and phase7.sql.
-- ============================================================================

-- ---- contacts ---------------------------------------------------------------
insert into contacts (id, name, email, phone) values
  ('dddd0001-0000-4000-8000-000000000001','Hannah Whitfield','hannah.whitfield@example.com','(419) 555-0142'),
  ('dddd0001-0000-4000-8000-000000000002','Priya Raman','priya.raman@example.com','(419) 555-0188'),
  ('dddd0001-0000-4000-8000-000000000003','Marcus Coleman','marcus.coleman@example.com','(440) 555-0119'),
  ('dddd0001-0000-4000-8000-000000000004','Grace Nguyen','grace.nguyen@example.com','(216) 555-0177'),
  ('dddd0001-0000-4000-8000-000000000005','Bauer Company Events','events@bauerco.example.com','(419) 555-0200'),
  ('dddd0001-0000-4000-8000-000000000006','Tessa Lindgren','tessa.lindgren@example.com','(567) 555-0163')
on conflict (id) do nothing;

-- ---- leads: one at every pipeline stage, so the board is never lopsided ------
insert into leads (id, contact_id, name, email, phone, event_type, event_date, guest_count, budget, message, source, heard_about, style, segment, stage, score, ai_priority, ai_summary) values
  ('dddd0002-0000-4000-8000-000000000001','dddd0001-0000-4000-8000-000000000001','Hannah Whitfield & Wes Parker','hannah.whitfield@example.com','(419) 555-0142','Wedding','2026-09-19',180,'$24,000','We fell in love with the orchard photos. Is the third weekend of September still open?','website','Instagram','Rustic elegant','wedding','proposal',92,'hot','Ready to book. Toured twice, asked about the silo block for family. Send the Harvest package with the two-night add-on.'),
  ('dddd0002-0000-4000-8000-000000000002','dddd0001-0000-4000-8000-000000000002','Priya Raman & Sam Ellis','priya.raman@example.com','(419) 555-0188','Wedding','2027-06-12',140,'$19,500','Looking for a summer garden feel with space for a live band.','the_knot','The Knot','Garden romantic','wedding','toured',78,'warm','Toured last Saturday and loved the porch. Concerned about rain plan — send the covered-porch layout.'),
  ('dddd0002-0000-4000-8000-000000000003','dddd0001-0000-4000-8000-000000000004','Grace Nguyen & Theo Brandt','grace.nguyen@example.com','(216) 555-0177','Wedding','2027-05-22',95,'$16,000','Smaller guest list, but we want the whole weekend on site.','referral','A friend married here','Intimate modern','wedding','new',64,'warm','New enquiry, under 100 guests. Good fit for a Friday. Respond within the hour to hold the response-time average.'),
  ('dddd0002-0000-4000-8000-000000000004','dddd0001-0000-4000-8000-000000000005','Bauer Company — Fall Summit','events@bauerco.example.com','(419) 555-0200','Corporate','2026-10-08',80,'$9,000','Annual leadership retreat, need AV and a private dining space.','website','Google','Corporate','corporate','booked',88,'hot','Booked and deposit paid. Repeat client — third year running. Confirm AV requirements four weeks out.'),
  ('dddd0002-0000-4000-8000-000000000005','dddd0001-0000-4000-8000-000000000003','Marcus & Dani Coleman','marcus.coleman@example.com','(440) 555-0119','Wedding','2026-07-26',165,'$22,000','','referral','Vendor referral','Classic','wedding','booked',95,'hot','Wedding completed in July. Follow up for a review and a first-anniversary stay offer.'),
  ('dddd0002-0000-4000-8000-000000000006','dddd0001-0000-4000-8000-000000000006','Tessa Lindgren & Ana Ruiz','tessa.lindgren@example.com','(567) 555-0163','Wedding','2027-08-14',210,'$28,000','Went with a venue closer to Cleveland — thank you though!','wedding_wire','WeddingWire','Bold modern','wedding','lost',40,'nurture','Lost on travel distance for guests. Worth a nurture email when the shuttle partnership is live.')
on conflict (id) do nothing;

-- ---- events / bookings ------------------------------------------------------
insert into events (id, lead_id, contact_id, title, event_type, event_date, end_date, status, package, guest_count, total_value, deposit_paid, notes) values
  ('dddd0003-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000001','dddd0001-0000-4000-8000-000000000001','Whitfield & Parker Wedding','wedding','2026-09-19','2026-09-20','tentative','The Harvest',180,24000,0,'Proposal sent — hold expires in 10 days.'),
  ('dddd0003-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000004','dddd0001-0000-4000-8000-000000000005','Bauer Company Fall Summit','corporate','2026-10-08',null,'confirmed','The Gathering',80,9000,3000,'AV package confirmed. Lunch for 80 in the barn.'),
  ('dddd0003-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000005','dddd0001-0000-4000-8000-000000000003','Coleman Wedding','wedding','2026-07-26','2026-07-27','completed','The Homestead',165,22000,22000,'Completed. Minor baseboard scuff by the bar — logged on the turnover.'),
  ('dddd0003-0000-4000-8000-000000000004','dddd0002-0000-4000-8000-000000000002','dddd0001-0000-4000-8000-000000000002','Raman & Ellis Wedding','wedding','2027-06-12','2027-06-13','tour',null,140,19500,0,'Second tour booked for the 14th.')
on conflict (id) do nothing;

-- ---- payments & invoices ----------------------------------------------------
insert into payments (id, event_id, amount, status) values
  ('dddd0004-0000-4000-8000-000000000001','dddd0003-0000-4000-8000-000000000002',3000,'succeeded'),
  ('dddd0004-0000-4000-8000-000000000002','dddd0003-0000-4000-8000-000000000003',11000,'succeeded'),
  ('dddd0004-0000-4000-8000-000000000003','dddd0003-0000-4000-8000-000000000003',11000,'succeeded')
on conflict (id) do nothing;

insert into invoices (id, lead_id, event_id, label, amount, due_date, status) values
  ('dddd0005-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000004','dddd0003-0000-4000-8000-000000000002','Final balance',6000,'2026-09-24','sent'),
  ('dddd0005-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000001','dddd0003-0000-4000-8000-000000000001','Booking deposit',7200,'2026-08-30','draft'),
  ('dddd0005-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000005','dddd0003-0000-4000-8000-000000000003','Final balance',11000,'2026-07-12','paid')
on conflict (id) do nothing;

-- ---- contracts --------------------------------------------------------------
insert into contracts (id, lead_id, client_name, event_type, event_date, value, status, deposit, deposit_paid, signed_at, signer_name) values
  ('dddd0006-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000004','Bauer Company Events','Corporate','2026-10-08',9000,'signed',3000,true,'2026-06-02 14:22:00+00','Dana Bauer'),
  ('dddd0006-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000001','Hannah Whitfield & Wes Parker','Wedding','2026-09-19',24000,'sent',7200,false,null,null),
  ('dddd0006-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000005','Marcus & Dani Coleman','Wedding','2026-07-26',22000,'signed',6600,true,'2025-11-18 19:05:00+00','Marcus Coleman')
on conflict (id) do nothing;

-- ---- conversations + messages (unified inbox) -------------------------------
insert into conversations (id, contact_id, lead_id, name, channel, last_at, unread) values
  ('dddd0007-0000-4000-8000-000000000001','dddd0001-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000001','Hannah Whitfield','email',now() - interval '2 hours',true),
  ('dddd0007-0000-4000-8000-000000000002','dddd0001-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000002','Priya Raman','sms',now() - interval '1 day',false),
  ('dddd0007-0000-4000-8000-000000000003','dddd0001-0000-4000-8000-000000000004','dddd0002-0000-4000-8000-000000000003','Grace Nguyen','web_chat',now() - interval '20 minutes',true)
on conflict (id) do nothing;

insert into messages (id, lead_id, channel, role, body, ai_intent, created_at) values
  ('dddd0008-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000001','email','inbound','Is September 19th still available? We''d love to lock it in.','availability', now() - interval '3 hours'),
  ('dddd0008-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000001','email','ai','It is — I''m holding it for you for 10 days while you review the proposal.','availability', now() - interval '2 hours'),
  ('dddd0008-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000002','sms','inbound','What happens if it rains on the ceremony?','logistics', now() - interval '1 day'),
  ('dddd0008-0000-4000-8000-000000000004','dddd0002-0000-4000-8000-000000000002','sms','outbound','The covered porch seats 120 and we flip it in under an hour — I''ll send photos.','logistics', now() - interval '23 hours'),
  ('dddd0008-0000-4000-8000-000000000005','dddd0002-0000-4000-8000-000000000003','web_chat','inbound','Do you allow outside caterers?','pricing', now() - interval '20 minutes')
on conflict (id) do nothing;

-- ---- silo stays (short-term rental side) ------------------------------------
insert into silo_guests (id, name, email, silo, check_in, nights, total, status, repeat) values
  ('dddd0009-0000-4000-8000-000000000001','Alison Petrov','alison.petrov@example.com','the-orchard-silo','2026-08-14',2,478,'confirmed',false),
  ('dddd0009-0000-4000-8000-000000000002','The Kaur Family','kaur.family@example.com','the-harvest-silo','2026-08-21',3,717,'confirmed',true),
  ('dddd0009-0000-4000-8000-000000000003','Ben Alvarez','ben.alvarez@example.com','the-copper-silo','2026-09-18',2,498,'confirmed',false),
  ('dddd0009-0000-4000-8000-000000000004','Whitfield wedding party','hannah.whitfield@example.com','the-meadow-silo','2026-09-18',2,498,'tentative',false)
on conflict (id) do nothing;

-- ---- vendor network ---------------------------------------------------------
insert into vendors (id, name, category, tier, status, commission_rate, membership_fee, contact_email) values
  ('dddd000a-0000-4000-8000-000000000001','Harvest & Vine Catering','Catering','preferred','active',10,1200,'hello@harvestvine.example.com'),
  ('dddd000a-0000-4000-8000-000000000002','Lantern Room Florals','Florals','preferred','active',12,900,'studio@lanternroom.example.com'),
  ('dddd000a-0000-4000-8000-000000000003','Northshore Sound','DJ & AV','standard','active',8,0,'book@northshoresound.example.com'),
  ('dddd000a-0000-4000-8000-000000000004','Wren & Fox Photography','Photography','preferred','active',10,900,'hi@wrenandfox.example.com'),
  ('dddd000a-0000-4000-8000-000000000005','Sugar Maple Bakery','Cake & Desserts','standard','pending',8,0,'orders@sugarmaple.example.com')
on conflict (id) do nothing;

-- ---- reviews ----------------------------------------------------------------
insert into reviews (id, source, author, rating, body, event_id, review_date) values
  ('dddd000b-0000-4000-8000-000000000001','google','Marcus C.',5,'We got married here in July and it was everything. The barn at sunset is unreal, and the team handled every detail so we did not have to.','dddd0003-0000-4000-8000-000000000003','2026-08-02'),
  ('dddd000b-0000-4000-8000-000000000002','the_knot','Dani C.',5,'Staying in the silos the night before meant no rushing in the morning. Worth every penny.','dddd0003-0000-4000-8000-000000000003','2026-08-04'),
  ('dddd000b-0000-4000-8000-000000000003','google','Dana B.',5,'Third year hosting our leadership summit here. Reliable, beautiful, and the food is genuinely good.','dddd0003-0000-4000-8000-000000000002','2025-10-14'),
  ('dddd000b-0000-4000-8000-000000000004','airbnb','Alison P.',4,'Gorgeous silo stay. Only note is that the coffee ran out — tiny thing in an otherwise perfect weekend.',null,'2026-08-17')
on conflict (id) do nothing;

-- ---- operations: tasks, inventory -------------------------------------------
insert into op_tasks (id, title, category, assignee_name, event_id, due_at, status, recurring) values
  ('dddd000c-0000-4000-8000-000000000001','Confirm final headcount with Bauer','bookings','Rachel','dddd0003-0000-4000-8000-000000000002', current_date + 3,'open',false),
  ('dddd000c-0000-4000-8000-000000000002','Mow ceremony lawn + orchard rows','grounds','Walt',null, current_date + 1,'open',true),
  ('dddd000c-0000-4000-8000-000000000003','Restock restroom supplies','operations','Lena',null, current_date,'open',true),
  ('dddd000c-0000-4000-8000-000000000004','Send Whitfield proposal follow-up','sales','Rachel','dddd0003-0000-4000-8000-000000000001', current_date + 2,'open',false),
  ('dddd000c-0000-4000-8000-000000000005','Service the barn HVAC filter','maintenance','Walt',null, current_date - 1,'done',false)
on conflict (id) do nothing;

insert into inventory_items (id, name, category, quantity, par_level, unit) values
  ('dddd000d-0000-4000-8000-000000000001','White folding chairs','Furniture',220,200,'each'),
  ('dddd000d-0000-4000-8000-000000000002','Round tables (60")','Furniture',24,22,'each'),
  ('dddd000d-0000-4000-8000-000000000003','Bath towels','Linens',18,32,'each'),
  ('dddd000d-0000-4000-8000-000000000004','Coffee pods','Consumables',40,120,'each'),
  ('dddd000d-0000-4000-8000-000000000005','Toilet paper','Consumables',96,72,'roll'),
  ('dddd000d-0000-4000-8000-000000000006','String light bulbs','Decor',14,40,'each')
on conflict (id) do nothing;

-- ---- expenses (Phase 7) -----------------------------------------------------
insert into expenses (id, incurred_on, category, vendor, description, amount, tax_deductible) values
  ('dddd000e-0000-4000-8000-000000000001', current_date - 6,'cleaning','Lena Ortiz','Orchard + Harvest silo turnovers',96,true),
  ('dddd000e-0000-4000-8000-000000000002', current_date - 9,'supplies','Restaurant Depot','Restroom + kitchen restock',214.38,true),
  ('dddd000e-0000-4000-8000-000000000003', current_date - 12,'cleaning','Marco Reyes','Coleman wedding full-venue clean',284.17,true),
  ('dddd000e-0000-4000-8000-000000000004', current_date - 16,'maintenance','Erie Septic Co.','Annual septic pump & inspection',465,true),
  ('dddd000e-0000-4000-8000-000000000005', current_date - 23,'utilities','Firelands Electric','Barn + silos — monthly',612.44,true),
  ('dddd000e-0000-4000-8000-000000000006', current_date - 28,'marketing','The Knot','Featured listing — quarterly',899,true),
  ('dddd000e-0000-4000-8000-000000000007', current_date - 33,'insurance','Grange Mutual','Event liability — monthly',388.50,true)
on conflict (id) do nothing;

-- ---- turnovers (Phase 7) ----------------------------------------------------
insert into turnovers (id, resource_slug, unit_kind, scheduled_for, status, cleaner_name, hourly_rate, expected_minutes, actual_minutes, cost, notes) values
  ('dddd000f-0000-4000-8000-000000000001','the-orchard-silo','silo', current_date - 6,'done','Lena',42,75,68,47.60,'Silo checkout'),
  ('dddd000f-0000-4000-8000-000000000002','the-harvest-silo','silo', current_date - 1,'in_progress','Lena',42,75,null,null,'Silo checkout'),
  ('dddd000f-0000-4000-8000-000000000003','venue','main_venue', current_date + 2,'scheduled','Marco + crew',55,375,null,null,'Whitfield Wedding'),
  ('dddd000f-0000-4000-8000-000000000004','venue','bridal_barn', current_date - 12,'flagged','Marco',55,240,310,284.17,'Coleman Wedding')
on conflict (id) do nothing;

insert into turnover_tasks (id, turnover_id, label, category, done, sort_order) values
  ('dddd0010-0000-4000-8000-000000000001','dddd000f-0000-4000-8000-000000000002','Strip & remake beds with fresh linens','cleaning',true,0),
  ('dddd0010-0000-4000-8000-000000000002','dddd000f-0000-4000-8000-000000000002','Bathroom: shower, toilet, sink, mirror','cleaning',true,1),
  ('dddd0010-0000-4000-8000-000000000003','dddd000f-0000-4000-8000-000000000002','Floors vacuumed & mopped','cleaning',true,2),
  ('dddd0010-0000-4000-8000-000000000004','dddd000f-0000-4000-8000-000000000002','Kitchenette wiped; fridge emptied & cleaned','cleaning',false,3),
  ('dddd0010-0000-4000-8000-000000000005','dddd000f-0000-4000-8000-000000000002','Restock: coffee, tea, paper goods, soap','stocking',false,4),
  ('dddd0010-0000-4000-8000-000000000006','dddd000f-0000-4000-8000-000000000002','Trash & recycling out','cleaning',false,5),
  ('dddd0010-0000-4000-8000-000000000007','dddd000f-0000-4000-8000-000000000002','Staging: towels folded, bed styled, lights set','staging',false,6),
  ('dddd0010-0000-4000-8000-000000000008','dddd000f-0000-4000-8000-000000000002','Check for damage or missing items','inspect',false,7)
on conflict (id) do nothing;

insert into turnover_issues (id, turnover_id, kind, description, est_cost, resolved) values
  ('dddd0011-0000-4000-8000-000000000001','dddd000f-0000-4000-8000-000000000002','missing','One bath towel missing',18,false),
  ('dddd0011-0000-4000-8000-000000000002','dddd000f-0000-4000-8000-000000000004','damage','Scuffed baseboard by the bar',60,false)
on conflict (id) do nothing;

-- ---- billable fee charges (Phase 7) -----------------------------------------
insert into fee_charges (id, fee_code, lead_id, event_id, quantity, amount, reason, waived) values
  ('dddd0012-0000-4000-8000-000000000001','outside_vendor','dddd0002-0000-4000-8000-000000000001','dddd0003-0000-4000-8000-000000000001',1,350,'Outside caterer — Harvest & Vine',false),
  ('dddd0012-0000-4000-8000-000000000002','late_checkout','dddd0002-0000-4000-8000-000000000005','dddd0003-0000-4000-8000-000000000003',2,240,'Guests cleared 2h 07m past close',false),
  ('dddd0012-0000-4000-8000-000000000003','extra_walkthrough','dddd0002-0000-4000-8000-000000000002',null,1.5,180,'Second site visit with florist',false),
  ('dddd0012-0000-4000-8000-000000000004','late_checkout','dddd0002-0000-4000-8000-000000000004','dddd0003-0000-4000-8000-000000000002',0,0,'Cleared 11 min past — inside grace window',true)
on conflict (id) do nothing;

-- ---- client portal: documents, RSVPs, seating -------------------------------
insert into documents (id, lead_id, name, path, kind, uploaded_by) values
  ('dddd0013-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000001','Signed contract.pdf','demo/whitfield-contract.pdf','contract','venue'),
  ('dddd0013-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000001','Caterer insurance certificate.pdf','demo/harvest-vine-coi.pdf','insurance','couple'),
  ('dddd0013-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000001','Day-of timeline.pdf','demo/whitfield-timeline.pdf','other','venue')
on conflict (id) do nothing;

insert into seating_tables (id, lead_id, label, capacity) values
  ('dddd0014-0000-4000-8000-000000000001','dddd0002-0000-4000-8000-000000000001','Head table',12),
  ('dddd0014-0000-4000-8000-000000000002','dddd0002-0000-4000-8000-000000000001','Table 1',10),
  ('dddd0014-0000-4000-8000-000000000003','dddd0002-0000-4000-8000-000000000001','Table 2',10),
  ('dddd0014-0000-4000-8000-000000000004','dddd0002-0000-4000-8000-000000000001','Table 3',10)
on conflict (id) do nothing;

insert into rsvps (id, wedding_slug, guest_name, email, party_size, meal, status, future_couple) values
  ('dddd0015-0000-4000-8000-000000000001','whitfield-parker','Ellen Parker','ellen.parker@example.com',2,'Chicken','attending',false),
  ('dddd0015-0000-4000-8000-000000000002','whitfield-parker','Jordan Whitfield','jordan.w@example.com',1,'Vegetarian','attending',false),
  ('dddd0015-0000-4000-8000-000000000003','whitfield-parker','Cameron Diaz-Lee','cam.dl@example.com',2,'Beef','attending',true),
  ('dddd0015-0000-4000-8000-000000000004','whitfield-parker','Sofia Marchetti','sofia.m@example.com',1,null,'declined',false)
on conflict (id) do nothing;

-- ---- referral coupons -------------------------------------------------------
insert into coupons (id, code, kind, amount, expires_at, uses, max_uses, active) values
  ('dddd0016-0000-4000-8000-000000000001','COLEMAN10','percent',10, now() + interval '180 days',1,5,true),
  ('dddd0016-0000-4000-8000-000000000002','STAYTWO','amount',150, now() + interval '90 days',3,25,true),
  ('dddd0016-0000-4000-8000-000000000003','OPENHOUSE','percent',15, now() - interval '10 days',8,50,false)
on conflict (id) do nothing;

-- ============================================================================
-- VERIFY
--   select stage, count(*) from leads where id::text like 'dddd%' group by stage;
--   select count(*) from events   where id::text like 'dddd%';   -- expect 4
--   select count(*) from expenses where id::text like 'dddd%';   -- expect 7
-- Then walk the dashboard: every section should have something in it.
-- ============================================================================

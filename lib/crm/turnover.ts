/* ============================================================================
   TURNOVER / HOUSEKEEPING
   Built around the owner's own numbers so "what does a clean actually cost?"
   is answerable from data instead of estimated:
     · bins/silos      60–90 min
     · bridal barn     3–5 hours
     · main venue      5.5–7 hours
     · rates           $35–50/hr independent, $50–75/hr professional
     · budget          $720–1,080 per event (all units)
   Tracking actual-vs-benchmark turns "interview 2–3 cleaners" into a
   negotiation backed by real minutes and real cost per unit.
   ============================================================================ */

export type UnitKind = "silo" | "bridal_barn" | "main_venue" | "farmhouse";
export type TurnoverStatus = "scheduled" | "in_progress" | "done" | "flagged";
export type IssueKind = "damage" | "missing" | "maintenance";

/** The owner's benchmarks, in minutes. Actuals are compared against these. */
export const BENCHMARKS: Record<UnitKind, { label: string; min: number; max: number }> = {
  silo:        { label: "Silo / bin",   min: 60,  max: 90 },
  bridal_barn: { label: "Bridal barn",  min: 180, max: 300 },
  main_venue:  { label: "Main venue",   min: 330, max: 420 },
  farmhouse:   { label: "Farmhouse",    min: 120, max: 210 },
};

/** Per-event budget guardrail from the notes ($720–1,080 all-in). */
export const EVENT_CLEAN_BUDGET = { min: 720, max: 1080 };

/** Rate bands, for comparing quotes when interviewing cleaners. */
export const RATE_BANDS = {
  independent: { min: 35, max: 50 },
  professional: { min: 50, max: 75 },
};

export type TurnoverTask = { id: string; label: string; category: "cleaning" | "staging" | "stocking" | "inspect"; done: boolean };
export type TurnoverIssue = { id: string; kind: IssueKind; description: string; estCost: number; resolved: boolean };
export type TurnoverPhoto = { id: string; phase: "before" | "after" | "damage"; path: string; caption?: string };

export type Turnover = {
  id: string;
  resourceSlug: string;
  unitKind: UnitKind;
  eventTitle?: string;
  scheduledFor: string;
  status: TurnoverStatus;
  cleanerName: string;
  hourlyRate: number;
  expectedMinutes: number;
  actualMinutes: number | null;
  cost: number | null;
  tasks: TurnoverTask[];
  issues: TurnoverIssue[];
  photos: TurnoverPhoto[];
  notes?: string;
};

/* ---- standard checklists (what "done" means for each unit) ---------------- */

const SILO_CHECKLIST: Omit<TurnoverTask, "id" | "done">[] = [
  { label: "Strip & remake beds with fresh linens", category: "cleaning" },
  { label: "Bathroom: shower, toilet, sink, mirror", category: "cleaning" },
  { label: "Floors vacuumed & mopped", category: "cleaning" },
  { label: "Kitchenette wiped; fridge emptied & cleaned", category: "cleaning" },
  { label: "Restock: coffee, tea, paper goods, soap", category: "stocking" },
  { label: "Trash & recycling out", category: "cleaning" },
  { label: "Staging: towels folded, bed styled, lights set", category: "staging" },
  { label: "Check for damage or missing items", category: "inspect" },
];

const VENUE_CHECKLIST: Omit<TurnoverTask, "id" | "done">[] = [
  { label: "Tables & chairs wiped and reset to layout", category: "staging" },
  { label: "Floors swept & mopped (barn + entry)", category: "cleaning" },
  { label: "Restrooms fully cleaned & restocked", category: "cleaning" },
  { label: "Bar area cleared, wiped, glassware returned", category: "cleaning" },
  { label: "Kitchen / prep area sanitised", category: "cleaning" },
  { label: "All trash & recycling removed from property", category: "cleaning" },
  { label: "Décor and rentals staged for pickup", category: "staging" },
  { label: "Restock restroom + kitchen supplies", category: "stocking" },
  { label: "Walk the grounds for litter & lost items", category: "inspect" },
  { label: "Photograph any damage before guests depart", category: "inspect" },
];

export function checklistFor(kind: UnitKind): Omit<TurnoverTask, "id" | "done">[] {
  return kind === "silo" ? SILO_CHECKLIST : VENUE_CHECKLIST;
}

/* ---- math ----------------------------------------------------------------- */

export const costOf = (minutes: number, hourlyRate: number) =>
  Math.round((minutes / 60) * hourlyRate * 100) / 100;

/** How an actual clean compares to the benchmark band for its unit. */
export function varianceOf(t: Turnover): { state: "under" | "on" | "over"; deltaMin: number } | null {
  if (t.actualMinutes == null) return null;
  const b = BENCHMARKS[t.unitKind];
  if (t.actualMinutes < b.min) return { state: "under", deltaMin: t.actualMinutes - b.min };
  if (t.actualMinutes > b.max) return { state: "over", deltaMin: t.actualMinutes - b.max };
  return { state: "on", deltaMin: 0 };
}

export const fmtMinutes = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m}m`;

/* ---- sample data (demo mode) ---------------------------------------------- */

const mk = (list: Omit<TurnoverTask, "id" | "done">[], doneCount = 0): TurnoverTask[] =>
  list.map((t, i) => ({ ...t, id: `tt${i}`, done: i < doneCount }));

export const sampleTurnovers: Turnover[] = [
  {
    id: "TO-1", resourceSlug: "the-orchard-silo", unitKind: "silo", eventTitle: "Silo checkout",
    scheduledFor: "2026-07-30", status: "done", cleanerName: "Lena", hourlyRate: 42,
    expectedMinutes: 75, actualMinutes: 68, cost: costOf(68, 42),
    tasks: mk(SILO_CHECKLIST, SILO_CHECKLIST.length), issues: [], photos: [],
  },
  {
    id: "TO-2", resourceSlug: "the-harvest-silo", unitKind: "silo", eventTitle: "Silo checkout",
    scheduledFor: "2026-07-31", status: "in_progress", cleanerName: "Lena", hourlyRate: 42,
    expectedMinutes: 75, actualMinutes: null, cost: null,
    tasks: mk(SILO_CHECKLIST, 3),
    issues: [{ id: "i1", kind: "missing", description: "One bath towel missing", estCost: 18, resolved: false }],
    photos: [],
  },
  {
    id: "TO-3", resourceSlug: "venue", unitKind: "main_venue", eventTitle: "Whitfield Wedding",
    scheduledFor: "2026-08-02", status: "scheduled", cleanerName: "Marco + crew", hourlyRate: 55,
    expectedMinutes: 375, actualMinutes: null, cost: null,
    tasks: mk(VENUE_CHECKLIST), issues: [], photos: [],
  },
  {
    id: "TO-4", resourceSlug: "venue", unitKind: "bridal_barn", eventTitle: "Coleman Wedding",
    scheduledFor: "2026-07-26", status: "done", cleanerName: "Marco", hourlyRate: 55,
    expectedMinutes: 240, actualMinutes: 310, cost: costOf(310, 55),
    tasks: mk(VENUE_CHECKLIST, VENUE_CHECKLIST.length),
    issues: [{ id: "i2", kind: "damage", description: "Scuffed baseboard by the bar", estCost: 60, resolved: false }],
    photos: [],
  },
];

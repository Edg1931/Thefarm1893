/* ============================================================================
   BACK-OF-HOUSE OPERATIONS DATA
   Staff-assigned tasks, inventory (with low-stock alerts), maintenance
   scheduling, and staff/time-clock. Sample data keeps the operations suite
   alive in a walkthrough; live rows come from Supabase once configured.
   ============================================================================ */

export type TaskCategory = "cleaning" | "setup" | "lawn" | "turnover" | "other";
export type TaskStatus = "todo" | "in_progress" | "done";

export type OpTask = {
  id: string;
  title: string;
  category: TaskCategory;
  assignee: string;
  eventTitle?: string;
  dueAt: string; // ISO date
  status: TaskStatus;
  recurring?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  parLevel: number;
  unit: string;
};

export type MaintenanceAsset = {
  id: string;
  name: string;
  kind: "hvac" | "pool" | "septic" | "grounds" | "other";
  lastService: string;
  nextService: string;
  intervalDays: number;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  permissions: string[]; // e.g. ["bookings","payments","operations"]
  hourlyRate: number;
  active: boolean;
  clockedInAt: string | null;
};

/* ---- sample data ---------------------------------------------------------- */

const today = "2026-07-30";
const soon = (days: number) => { const d = new Date(today + "T00:00:00"); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

export const sampleTasks: OpTask[] = [
  { id: "T-01", title: "Reset barn for Whitfield wedding", category: "setup", assignee: "Marco", eventTitle: "Whitfield Wedding", dueAt: soon(2), status: "todo" },
  { id: "T-02", title: "Deep clean Orchard Silo after checkout", category: "turnover", assignee: "Lena", eventTitle: "Silo turnover", dueAt: soon(1), status: "in_progress", recurring: "per stay" },
  { id: "T-03", title: "Mow ceremony lawn + trim orchard rows", category: "lawn", assignee: "Marco", dueAt: soon(3), status: "todo", recurring: "weekly" },
  { id: "T-04", title: "Launder + press 220 napkins", category: "cleaning", assignee: "Lena", dueAt: soon(4), status: "todo" },
  { id: "T-05", title: "Stage farmhouse for weekend guests", category: "setup", assignee: "Priya", eventTitle: "Farmhouse stay", dueAt: soon(0), status: "todo" },
  { id: "T-06", title: "Bathroom refresh — event restrooms", category: "cleaning", assignee: "Lena", dueAt: soon(-1), status: "done", recurring: "per event" },
];

export const sampleInventory: InventoryItem[] = [
  { id: "I-01", name: "Wooden farm tables (8ft)", category: "Furniture", quantity: 26, parLevel: 24, unit: "tables" },
  { id: "I-02", name: "Cross-back chairs", category: "Furniture", quantity: 210, parLevel: 220, unit: "chairs" },
  { id: "I-03", name: "Ivory table linens", category: "Linens", quantity: 18, parLevel: 30, unit: "linens" },
  { id: "I-04", name: "String-light strands", category: "Décor", quantity: 40, parLevel: 30, unit: "strands" },
  { id: "I-05", name: "Cloth napkins", category: "Linens", quantity: 240, parLevel: 220, unit: "napkins" },
  { id: "I-06", name: "Whiskey barrels (cocktail)", category: "Décor", quantity: 6, parLevel: 8, unit: "barrels" },
  { id: "I-07", name: "Propane heaters", category: "Comfort", quantity: 4, parLevel: 6, unit: "heaters" },
];

export const sampleMaintenance: MaintenanceAsset[] = [
  { id: "M-01", name: "Barn HVAC — main", kind: "hvac", lastService: "2026-04-10", nextService: soon(9), intervalDays: 120 },
  { id: "M-02", name: "Farmhouse septic", kind: "septic", lastService: "2026-01-15", nextService: soon(45), intervalDays: 365 },
  { id: "M-03", name: "Pool / hot tub", kind: "pool", lastService: "2026-07-20", nextService: soon(4), intervalDays: 14 },
  { id: "M-04", name: "Orchard irrigation", kind: "grounds", lastService: "2026-06-01", nextService: soon(-3), intervalDays: 60 },
];

export const sampleStaff: StaffMember[] = [
  { id: "ST-01", name: "Rachel (Owner)", role: "Owner", permissions: ["all"], hourlyRate: 0, active: true, clockedInAt: null },
  { id: "ST-02", name: "Marco", role: "Grounds & Setup Lead", permissions: ["operations", "bookings"], hourlyRate: 24, active: true, clockedInAt: "2026-07-30T13:00:00Z" },
  { id: "ST-03", name: "Lena", role: "Housekeeping Lead", permissions: ["operations"], hourlyRate: 22, active: true, clockedInAt: null },
  { id: "ST-04", name: "Priya", role: "Guest Experience", permissions: ["operations", "portal"], hourlyRate: 20, active: true, clockedInAt: null },
  { id: "ST-05", name: "Devon", role: "Weekend Attendant", permissions: ["operations"], hourlyRate: 18, active: false, clockedInAt: null },
];

/* ---- derived helpers ------------------------------------------------------ */

export const isLowStock = (i: InventoryItem) => i.quantity < i.parLevel;
export function maintenanceDueSoon(a: MaintenanceAsset, withinDays = 14): boolean {
  const next = new Date(a.nextService + "T00:00:00").getTime();
  return next <= Date.now() + withinDays * 86_400_000;
}

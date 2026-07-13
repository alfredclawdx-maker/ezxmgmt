/* ---------- Stage model (5 active columns + LOST off-board) ---------- */
export const STAGES = [
  { id: "NEW", label: "New", hint: "Needs qualification" },
  { id: "QUALIFIED", label: "Qualified", hint: "Ready to offer" },
  { id: "OFFERED", label: "Offered", hint: "Awaiting contractor" },
  { id: "ACCEPTED", label: "Accepted", hint: "Collect payment" },
  { id: "SOLD", label: "Sold", hint: "Revenue recorded" },
];
export const STAGE_IDS = STAGES.map((s) => s.id);

export const LOSS_REASONS = [
  "Budget too low",
  "Timeline unrealistic",
  "Unresponsive homeowner",
  "Project outside scope",
  "Contractor unavailable",
];

export const HOUR = 3600000;

/* ---------- Health (rulebook thresholds) ---------- */
export const health = (score) => (score >= 80 ? "green" : score >= 60 ? "yellow" : "red");
export const HEALTH_DOT = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-red-500" };
export const HEALTH_LABEL = { green: "Pursue", yellow: "Nurture", red: "Low priority" };
export const probColor = (p) => (p > 70 ? "text-emerald-400" : p >= 50 ? "text-amber-400" : "text-red-400");

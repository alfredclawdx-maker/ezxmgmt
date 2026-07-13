import { HOUR } from "./constants.js";

/* ---------- Formatting ---------- */
export const fmtMoney = (n) => "$" + (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : n);
export const fmtBudget = (l) => `$${Math.round(l.project.budgetMin / 1000)}–${Math.round(l.project.budgetMax / 1000)}K`;

export function fmtDuration(ms) {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60000))}m`;
  if (ms < 24 * HOUR) return `${Math.round(ms / HOUR)}h`;
  return `${(ms / (24 * HOUR)).toFixed(1)}d`;
}
export const timeInStage = (lead, now) => fmtDuration(now - new Date(lead.stageEnteredAt).getTime());
export const fmtClock = (iso) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

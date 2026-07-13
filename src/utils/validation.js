import { HOUR } from "./constants.js";

/* ---------- Stall detection ---------- */
export const stallInfo = (lead, now) => {
  if (lead.currentStage !== "OFFERED") return null;
  const hrs = (now - new Date(lead.stageEnteredAt).getTime()) / HOUR;
  if (hrs >= 48) return { level: "urgent", hrs: Math.floor(hrs) };
  if (hrs >= 24) return { level: "warn", hrs: Math.floor(hrs) };
  return null;
};

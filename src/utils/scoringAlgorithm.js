import { HOUR } from "./constants.js";

/* ---------- Algorithms (per spec) ---------- */
export function calculateQualityScore(lead) {
  let score = 0;
  // Project type
  if (lead.project.type === "kitchen") score += 30;
  else if (lead.project.type === "bathroom") score += 25;
  else score += 15;
  // Budget
  if (lead.project.budgetMin >= 25000) score += 35;
  else if (lead.project.budgetMin >= 20000) score += 25;
  else if (lead.project.budgetMin >= 15000) score += 20;
  else score += 10;
  // Timeline
  if (lead.project.timelineDays <= 60) score += 30;
  else if (lead.project.timelineDays <= 90) score += 20;
  else score += 10;
  // Response time (minutes)
  if (lead.homeowner.responseTime <= 120) score += 15;
  else if (lead.homeowner.responseTime <= 240) score += 10;
  else score += 5;
  // Consultation completed
  if ((lead.activities || []).some((a) => a.action === "consultation_completed")) score += 10;
  return Math.min(score, 100);
}

export function calcWinProbability(lead, contractors) {
  let p = lead.qualityScore * 0.75; // base from quality
  if (lead.project.type === "kitchen") p += 8;
  else if (lead.project.type === "bathroom") p += 4;
  if (lead.project.budgetMin >= 20000 && lead.project.budgetMin < 30000) p += 5;
  if (lead.project.timelineDays >= 45 && lead.project.timelineDays <= 75) p += 4;
  // Best matched contractor's conversion rate nudges probability
  const offered = (lead.contractorOffers || []).map((o) => contractors.find((c) => c.id === o.contractorId)).filter(Boolean);
  const best = offered.length
    ? Math.max(...offered.map((c) => c.conversionRate))
    : Math.max(...contractors.map((c) => c.conversionRate));
  p += (best - 0.5) * 30;
  // Staleness penalty
  const days = (Date.now() - new Date(lead.createdAt).getTime()) / (24 * HOUR);
  p -= Math.min(days * 2, 15);
  return Math.round(Math.max(5, Math.min(95, p)));
}


/* ---------- CSV / JSON export helpers ---------- */
export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function leadsToCsv(leads) {
  const head = ["id", "name", "phone", "email", "project", "budget_min", "budget_max", "timeline_days", "score", "win_prob", "stage", "source", "revenue", "loss_reason"];
  const rows = leads.map((l) => [
    l.id, l.homeowner.name, l.homeowner.phone, l.homeowner.email, l.project.type,
    l.project.budgetMin, l.project.budgetMax, l.project.timelineDays,
    l.qualityScore, l.winProbability, l.currentStage, l.source,
    l.outcome.revenue ?? "", l.outcome.lossReason ?? "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [head.join(","), ...rows].join("\n");
}

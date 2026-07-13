import React, { useMemo } from "react";
import { fmtMoney } from "../utils/formatting.js";
import { stallInfo } from "../utils/validation.js";

/* ---------- Metrics bar ---------- */
export function MetricsBar({ leads, now }) {
  const m = useMemo(() => {
    const by = (s) => leads.filter((l) => l.currentStage === s).length;
    const total = leads.length;
    const nNew = by("NEW"), nQual = by("QUALIFIED"), nOff = by("OFFERED"), nAcc = by("ACCEPTED"), nSold = by("SOLD"), nLost = by("LOST");
    const reached = (stage) => leads.filter((l) => l.currentStage === stage || (l.stageHistory || []).some((h) => h.stage === stage) || (stage === "NEW")).length;
    const reachedQ = leads.filter((l) => ["QUALIFIED", "OFFERED", "ACCEPTED", "SOLD"].includes(l.currentStage) || (l.stageHistory || []).some((h) => h.stage === "QUALIFIED")).length;
    const reachedO = leads.filter((l) => ["OFFERED", "ACCEPTED", "SOLD"].includes(l.currentStage) || (l.stageHistory || []).some((h) => h.stage === "OFFERED")).length;
    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) + "%" : "—");
    const soldLeads = leads.filter((l) => l.currentStage === "SOLD");
    const revenue = soldLeads.reduce((s, l) => s + (l.outcome.revenue || 0), 0);
    const todayRev = soldLeads.filter((l) => l.outcome.closeDate && new Date(l.outcome.closeDate).toDateString() === new Date(now).toDateString()).reduce((s, l) => s + (l.outcome.revenue || 0), 0);
    const stalled = leads.filter((l) => stallInfo(l, now)).length;
    return { total, nNew, nQual, nOff, nAcc, nSold, nLost, qualConv: pct(reachedQ, total), offConv: pct(reachedO, reachedQ), soldConv: pct(nSold, reachedO), revenue, todayRev, stalled };
  }, [leads, now]);

  const Cell = ({ label, value, sub, tone }) => (
    <div className="flex-1 min-w-[100px] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-lg font-bold font-mono leading-tight ${tone || "text-slate-100"}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-mono">{sub}</div>}
    </div>
  );

  return (
    <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="flex flex-wrap items-stretch divide-x divide-slate-800 overflow-x-auto ezx-scroll">
        <Cell label="Leads" value={m.total} sub={`${m.nLost} lost`} />
        <Cell label="Qualified" value={m.nQual} sub={`${m.qualConv} of new`} />
        <Cell label="Offered" value={m.nOff} sub={`${m.offConv} of qual`} />
        <Cell label="Accepted" value={m.nAcc} />
        <Cell label="Sold" value={m.nSold} sub={`${m.soldConv} of offered`} tone="text-emerald-400" />
        <Cell label="Revenue" value={fmtMoney(m.revenue)} sub={`${fmtMoney(m.todayRev)} today`} tone="text-emerald-400" />
        <Cell label="Stalled" value={m.stalled} sub="24h+ no response" tone={m.stalled > 0 ? "text-red-400" : "text-slate-100"} />
      </div>
    </div>
  );
}

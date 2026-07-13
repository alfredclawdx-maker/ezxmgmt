import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { Dot } from "./ui.jsx";
import { health, HEALTH_LABEL, probColor } from "../utils/constants.js";
import { fmtMoney, fmtBudget, timeInStage } from "../utils/formatting.js";
import { stallInfo } from "../utils/validation.js";

/* ---------- Lead card ---------- */
export function LeadCard({ lead, now, onOpen, onDragStart, selected, onToggleSelect, actions }) {
  const h = health(lead.qualityScore);
  const stall = stallInfo(lead, now);
  const pendingOffers = lead.contractorOffers.filter((o) => o.status === "pending");

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onOpen(lead)}
      className={`group cursor-pointer select-none rounded-lg border p-3 mb-2 transition-colors bg-slate-800
        ${stall ? (stall.level === "urgent" ? "border-red-600 bg-red-950/40" : "border-amber-600/70") : "border-slate-700 hover:border-blue-600"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox" checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(lead.id); }}
            className="accent-blue-600 shrink-0"
            aria-label={`Select ${lead.homeowner.name}`}
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-100 truncate">{lead.homeowner.name}</div>
            <div className="text-xs text-slate-400 capitalize">{lead.project.type} · {fmtBudget(lead)}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-bold font-mono text-slate-100 leading-none">{lead.qualityScore}</div>
          <div className={`text-[10px] font-mono ${probColor(lead.winProbability)}`}>{lead.winProbability}% win</div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Dot tone={h} /> {HEALTH_LABEL[h]}
        </span>
        <span className="flex items-center gap-1 text-slate-400 font-mono">
          <Clock className="w-3 h-3" /> {timeInStage(lead, now)}
        </span>
      </div>

      {lead.currentStage === "OFFERED" && (
        <div className={`mt-2 text-[11px] font-medium ${stall ? "text-red-400" : "text-slate-400"}`}>
          {stall
            ? `⏰ ${stall.hrs}h no response — ${stall.level === "urgent" ? "escalate now" : "reminder due"}`
            : pendingOffers.length
              ? `Awaiting: ${pendingOffers.map((o) => o.contractorName.split(" ")[0]).join(", ")}`
              : "No pending offers"}
        </div>
      )}
      {lead.currentStage === "ACCEPTED" && (
        <div className="mt-2 text-[11px] text-amber-400 font-medium">
          {lead.contractorOffers.find((o) => o.status === "accepted")?.contractorName} accepted — collect {fmtMoney(lead.contractorOffers.find((o) => o.status === "accepted")?.price || 0)}
        </div>
      )}
      {lead.currentStage === "SOLD" && (
        <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {fmtMoney(lead.outcome.revenue || 0)} paid · {lead.outcome.contractorWinner}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">{actions}</div>
    </div>
  );
}

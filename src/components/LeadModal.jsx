import React, { useState } from "react";
import { X, Phone, Mail } from "lucide-react";
import { Btn } from "./ui.jsx";
import { CONTRACTORS } from "../data/contractorList.js";
import { STAGE_IDS, probColor } from "../utils/constants.js";
import { fmtMoney, timeInStage, fmtClock } from "../utils/formatting.js";
import { stallInfo } from "../utils/validation.js";

/* ---------- Lead detail modal ---------- */
export function LeadModal({ lead, now, onClose, onOfferResponse, onPayment, onNote, onMoveStage, onEscalate, onMarkLost }) {
  const [note, setNote] = useState("");
  if (!lead) return null;
  const accepted = lead.contractorOffers.find((o) => o.status === "accepted");
  const offeredIds = lead.contractorOffers.map((o) => o.contractorId);
  const backup = CONTRACTORS.find((c) => !offeredIds.includes(c.id));
  const stall = stallInfo(lead, now);

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">{title}</div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto ezx-scroll ezx-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{lead.homeowner.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">{lead.id} · {lead.source}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Section title="Homeowner">
              <div className="text-sm text-slate-200 space-y-1.5">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /><a href={`tel:${lead.homeowner.phone}`} className="text-blue-400 hover:underline font-mono text-xs">{lead.homeowner.phone}</a></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /><a href={`mailto:${lead.homeowner.email}`} className="text-blue-400 hover:underline text-xs">{lead.homeowner.email || "—"}</a></div>
                <div className="text-xs text-slate-400">SMS response: <span className="font-mono">{lead.homeowner.responseTime}m</span></div>
              </div>
            </Section>
            <Section title="Project">
              <div className="text-sm text-slate-200 space-y-1">
                <div className="capitalize">{lead.project.type} remodel</div>
                <div className="font-mono text-xs text-slate-300">${lead.project.budgetMin.toLocaleString()} – ${lead.project.budgetMax.toLocaleString()} · {lead.project.timelineDays} days</div>
                <div className="text-xs">Score <span className="font-mono font-bold text-slate-100">{lead.qualityScore}/100</span> · <span className={`font-mono ${probColor(lead.winProbability)}`}>{lead.winProbability}% win probability</span></div>
              </div>
            </Section>
          </div>

          <Section title="Pipeline status">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="px-2 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 font-semibold">{lead.currentStage}</span>
              <span className="font-mono">in stage {timeInStage(lead, now)}</span>
              <span className="font-mono text-slate-500">created {fmtClock(lead.createdAt)}</span>
              {stall && <span className="text-red-400 font-semibold">⏰ stalled {stall.hrs}h</span>}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-[11px] text-slate-400">Move to:</label>
              <select
                className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100"
                value={lead.currentStage}
                onChange={(e) => onMoveStage(lead, e.target.value)}
              >
                {STAGE_IDS.concat("LOST").map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {lead.currentStage !== "LOST" && lead.currentStage !== "SOLD" && <Btn tone="red" onClick={() => onMarkLost(lead)}>Mark lost</Btn>}
            </div>
          </Section>

          {lead.contractorOffers.length > 0 && (
            <Section title="Contractor offers">
              <div className="space-y-2">
                {lead.contractorOffers.map((o) => (
                  <div key={o.contractorId} className="p-3 rounded-lg border border-slate-700 bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-100">{o.contractorName}</div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${o.status === "accepted" ? "bg-emerald-950 text-emerald-400" : o.status === "declined" ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-400"}`}>{o.status.toUpperCase()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">offered {fmtClock(o.offeredAt)} · {fmtMoney(o.price)} · {o.tier}</div>
                    {o.status === "pending" && lead.currentStage === "OFFERED" && (
                      <div className="mt-2 flex gap-1.5">
                        <Btn tone="green" onClick={() => onOfferResponse(lead, o.contractorId, "accepted")}>Accept</Btn>
                        <Btn tone="red" onClick={() => onOfferResponse(lead, o.contractorId, "declined")}>Decline</Btn>
                      </div>
                    )}
                    {o.status === "accepted" && !o.paymentReceivedAt && lead.currentStage === "ACCEPTED" && (
                      <div className="mt-2"><Btn tone="green" onClick={() => onPayment(lead)}>Mark payment received ({fmtMoney(o.price)})</Btn></div>
                    )}
                    {o.paymentReceivedAt && <div className="mt-1 text-[11px] text-emerald-400 font-mono">paid {fmtClock(o.paymentReceivedAt)}</div>}
                  </div>
                ))}
                {!accepted && backup && lead.currentStage === "OFFERED" && (
                  <div className="p-3 rounded-lg border border-dashed border-slate-700 text-xs text-slate-400 flex items-center justify-between">
                    <span>{backup.name} on standby (backup)</span>
                    <Btn tone="amber" onClick={() => onEscalate(lead, backup)}>Escalate to backup</Btn>
                  </div>
                )}
              </div>
            </Section>
          )}

          <Section title="Notes">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                placeholder="Add a note to the activity log…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) { onNote(lead, note.trim()); setNote(""); } }}
              />
              <Btn tone="blue" disabled={!note.trim()} onClick={() => { onNote(lead, note.trim()); setNote(""); }}>Save note</Btn>
            </div>
          </Section>

          <Section title="Activity log">
            <div className="space-y-1.5 max-h-48 overflow-y-auto ezx-scroll pr-1">
              {[...lead.activities].reverse().map((a, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono text-slate-500 shrink-0 w-28">{fmtClock(a.timestamp)}</span>
                  <span className="text-slate-300"><span className="text-slate-400 font-mono">{a.action}</span>{a.notes ? ` — ${a.notes}` : ""}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

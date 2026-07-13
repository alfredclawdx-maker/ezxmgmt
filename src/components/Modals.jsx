import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Btn } from "./ui.jsx";
import { CONTRACTORS } from "../data/contractorList.js";
import { rankContractorsForLead } from "../utils/contractorMatching.js";
import { LOSS_REASONS } from "../utils/constants.js";
import { fmtMoney, fmtBudget } from "../utils/formatting.js";

/* ---------- Offer modal (contractor selection, ranked) ---------- */
export function OfferModal({ lead, leadsCount, onConfirm, onClose }) {
  const ranked = useMemo(() => (lead ? rankContractorsForLead(lead, CONTRACTORS) : []), [lead]);
  const [picked, setPicked] = useState(() => ranked.slice(0, 2).map((r) => r.contractor.id));
  const price = lead ? (lead.qualityScore >= 80 ? 600 : lead.qualityScore >= 60 ? 500 : 400) : 0;

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-5 ezx-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-100">Offer lead{leadsCount > 1 ? `s (${leadsCount})` : ""} to contractors</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        {lead && <p className="text-xs text-slate-400 mb-3">{lead.homeowner.name} · <span className="capitalize">{lead.project.type}</span> · {fmtBudget(lead)} · price tier <span className="font-mono text-slate-200">{fmtMoney(price)}</span>/lead</p>}
        <div className="space-y-2 mb-4">
          {ranked.map(({ contractor, matchScore, reasoning }, i) => (
            <label key={contractor.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${picked.includes(contractor.id) ? "border-blue-600 bg-blue-950/40" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}>
              <input type="checkbox" checked={picked.includes(contractor.id)} onChange={() => toggle(contractor.id)} className="accent-blue-600" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">{contractor.name} {i === 0 && <span className="text-[10px] text-blue-400 font-mono ml-1">BEST MATCH</span>}</div>
                <div className="text-[11px] text-slate-400">{reasoning}</div>
              </div>
              <div className="text-lg font-bold font-mono text-slate-200">{matchScore}<span className="text-[10px] text-slate-500">%</span></div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Btn tone="ghost" onClick={onClose}>Cancel</Btn>
          <Btn tone="blue" disabled={picked.length === 0} onClick={() => onConfirm(picked, price)}>Send offer{picked.length > 1 ? "s" : ""}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lost-reason modal ---------- */
export function LostModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState(LOSS_REASONS[0]);
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-5 ezx-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-100 mb-3">Mark lead as lost</h3>
        <div className="space-y-1.5 mb-4">
          {LOSS_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer text-sm ${reason === r ? "border-red-600 bg-red-950/30 text-slate-100" : "border-slate-700 text-slate-300 hover:border-slate-500"}`}>
              <input type="radio" name="lossReason" checked={reason === r} onChange={() => setReason(r)} className="accent-red-600" />
              {r}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Btn tone="ghost" onClick={onClose}>Cancel</Btn>
          <Btn tone="red" onClick={() => onConfirm(reason)}>Mark lost</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- Add-lead modal (simulates Leadpages submission) ---------- */
export function AddLeadModal({ onConfirm, onClose }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", type: "kitchen", budgetMin: 20000, budgetMax: 30000, timelineDays: 60, source: "manual_entry", responseTime: 60 });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const phoneOk = /^[\d\s()+-]{7,}$/.test(f.phone);
  const valid = f.name.trim() && phoneOk && Number(f.budgetMin) > 0 && Number(f.budgetMax) >= Number(f.budgetMin);

  const field = "w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none";
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-5 ezx-fade-in max-h-[90vh] overflow-y-auto ezx-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-100">Add lead</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-[11px] text-slate-400">Homeowner name</label><input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" /></div>
          <div><label className="text-[11px] text-slate-400">Phone</label><input className={`${field} ${f.phone && !phoneOk ? "border-red-600" : ""}`} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1-813-555-0100" /></div>
          <div><label className="text-[11px] text-slate-400">Email</label><input className={field} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" /></div>
          <div><label className="text-[11px] text-slate-400">Project type</label>
            <select className={field} value={f.type} onChange={(e) => set("type", e.target.value)}>
              <option value="kitchen">Kitchen</option><option value="bathroom">Bathroom</option><option value="general">General</option>
            </select>
          </div>
          <div><label className="text-[11px] text-slate-400">Source</label>
            <select className={field} value={f.source} onChange={(e) => set("source", e.target.value)}>
              <option value="leadpages_form">Leadpages</option><option value="google_ads">Google Ads</option><option value="manual_entry">Manual</option>
            </select>
          </div>
          <div><label className="text-[11px] text-slate-400">Budget min ($)</label><input type="number" className={field} value={f.budgetMin} onChange={(e) => set("budgetMin", Number(e.target.value))} /></div>
          <div><label className="text-[11px] text-slate-400">Budget max ($)</label><input type="number" className={field} value={f.budgetMax} onChange={(e) => set("budgetMax", Number(e.target.value))} /></div>
          <div><label className="text-[11px] text-slate-400">Timeline (days)</label><input type="number" className={field} value={f.timelineDays} onChange={(e) => set("timelineDays", Number(e.target.value))} /></div>
          <div><label className="text-[11px] text-slate-400">SMS response (min)</label><input type="number" className={field} value={f.responseTime} onChange={(e) => set("responseTime", Number(e.target.value))} /></div>
        </div>
        {f.phone && !phoneOk && <p className="text-[11px] text-red-400 mt-2">Phone number format looks off — check it before saving.</p>}
        <div className="flex justify-end gap-2 mt-4">
          <Btn tone="ghost" onClick={onClose}>Cancel</Btn>
          <Btn tone="blue" disabled={!valid} onClick={() => onConfirm(f)}>Create lead</Btn>
        </div>
      </div>
    </div>
  );
}

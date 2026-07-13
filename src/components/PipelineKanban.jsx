import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LogOut, Search, Download, Upload, Trophy, LayoutGrid, AlertTriangle, XCircle, Users, FileDown, Plus } from "lucide-react";
import { Btn, Toasts } from "./ui.jsx";
import { MetricsBar } from "./MetricsBar.jsx";
import { LeadCard } from "./LeadCard.jsx";
import { LeadModal } from "./LeadModal.jsx";
import { OfferModal, LostModal, AddLeadModal } from "./Modals.jsx";
import { ContractorLeaderboard } from "./ContractorLeaderboard.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { CONTRACTORS } from "../data/contractorList.js";
import { makeLead, buildSampleLeads } from "../data/sampleLeads.js";
import { STAGES, STAGE_IDS, HOUR } from "../utils/constants.js";
import { calcWinProbability } from "../utils/scoringAlgorithm.js";
import { fmtMoney } from "../utils/formatting.js";
import { stallInfo } from "../utils/validation.js";
import { downloadFile, leadsToCsv } from "../utils/exporters.js";

export function PipelineKanban({ onLogout }) {
  const [leads, setLeads] = useLocalStorage("ezx_leads", buildSampleLeads);
  const [now, setNow] = useState(Date.now());
  const [view, setView] = useState("kanban"); // kanban | leaderboard
  const [selectedLead, setSelectedLead] = useState(null);
  const [offerTarget, setOfferTarget] = useState(null); // {leadIds:[], moveAfter:bool}
  const [lostTarget, setLostTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selection, setSelection] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({ scoreMin: 0, types: ["kitchen", "bathroom", "general"], search: "" });
  const [dragOver, setDragOver] = useState(null);
  const undoSnapshots = useRef({});
  const importRef = useRef(null);

  /* Clock tick — 5s per spec (stall checks + time-in-stage refresh) */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  /* ----- Toast helpers ----- */
  const toast = useCallback((msg, tone = "info", undo = null) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, msg, tone, undo }].slice(-4));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 5000);
  }, []);
  const dismissToast = (id) => setToasts((ts) => ts.filter((t) => t.id !== id));
  const handleUndo = (t) => {
    const snap = undoSnapshots.current[t.undo];
    if (snap) { setLeads(snap); delete undoSnapshots.current[t.undo]; }
    dismissToast(t.id);
  };

  /* ----- Lead mutation helpers ----- */
  const patchLead = useCallback((id, fn) => {
    setLeads((ls) => ls.map((l) => {
      if (l.id !== id) return l;
      const next = fn({ ...l, homeowner: { ...l.homeowner }, project: { ...l.project }, contractorOffers: l.contractorOffers.map((o) => ({ ...o })), activities: [...l.activities], stageHistory: [...(l.stageHistory || [])], outcome: { ...l.outcome } });
      next.winProbability = calcWinProbability(next, CONTRACTORS);
      return next;
    }));
  }, []);

  const logActivity = (lead, action, notes, user = "you") => {
    lead.activities.push({ timestamp: new Date().toISOString(), action, notes, user });
  };

  const setStage = (lead, toStage) => {
    lead.stageHistory.push({ stage: lead.currentStage, enteredAt: lead.stageEnteredAt, exitedAt: new Date().toISOString() });
    lead.currentStage = toStage;
    lead.stageEnteredAt = new Date().toISOString();
  };

  /* ----- Stage transition with validation (exit criteria) ----- */
  const tryMove = useCallback((leadId, toStage, { silent = false } = {}) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.currentStage === toStage) return;
    const from = lead.currentStage;
    const fromIdx = STAGE_IDS.indexOf(from);
    const toIdx = STAGE_IDS.indexOf(toStage);

    // Forward-move validation
    if (toIdx > fromIdx) {
      if (from === "NEW" && lead.qualityScore < 60) {
        toast(`Can't qualify: score ${lead.qualityScore} is below the 60 minimum.`, "error");
        return;
      }
      if (toStage === "OFFERED" && !lead.contractorOffers.some((o) => o.status === "pending")) {
        // Route through offer flow instead of blocking
        setOfferTarget({ leadIds: [leadId], moveAfter: true });
        return;
      }
      if (toStage === "ACCEPTED" && !lead.contractorOffers.some((o) => o.status === "accepted")) {
        toast("Can't move to Accepted: no contractor has accepted yet. Open the lead to record a response.", "error");
        return;
      }
      if (toStage === "SOLD" && !lead.contractorOffers.some((o) => o.status === "accepted")) {
        toast("Can't mark Sold: no accepted offer on this lead.", "error");
        return;
      }
      // Skipping stages beyond the checks above
      if (toIdx - fromIdx > 1 && !(from === "OFFERED" && toStage === "SOLD")) {
        if (from === "NEW" && toStage !== "QUALIFIED") {
          toast("Move NEW leads to Qualified first — exit criteria run in order.", "error");
          return;
        }
      }
    }

    const snapKey = Math.random().toString(36).slice(2);
    undoSnapshots.current[snapKey] = leads;

    patchLead(leadId, (l) => {
      setStage(l, toStage);
      if (toStage === "SOLD") {
        const acc = l.contractorOffers.find((o) => o.status === "accepted");
        if (acc) {
          if (!acc.paymentReceivedAt) acc.paymentReceivedAt = new Date().toISOString();
          l.outcome = { result: "won", closeDate: new Date().toISOString(), revenue: acc.price, contractorWinner: acc.contractorName, lossReason: null };
          logActivity(l, "payment_received", `${fmtMoney(acc.price)} received from ${acc.contractorName} — SOLD`);
        }
      } else {
        logActivity(l, "stage_changed", `${from} → ${toStage}`);
      }
      return l;
    });
    if (!silent) toast(`${lead.homeowner.name}: ${from} → ${toStage}`, toStage === "SOLD" ? "success" : "info", snapKey);
  }, [leads, patchLead, toast]);

  /* ----- Offers ----- */
  const sendOffers = useCallback((leadIds, contractorIds, price) => {
    const snapKey = Math.random().toString(36).slice(2);
    undoSnapshots.current[snapKey] = leads;
    leadIds.forEach((id) => {
      patchLead(id, (l) => {
        contractorIds.forEach((cid) => {
          if (l.contractorOffers.some((o) => o.contractorId === cid && o.status === "pending")) return;
          const c = CONTRACTORS.find((x) => x.id === cid);
          l.contractorOffers.push({ contractorId: cid, contractorName: c.name, offeredAt: new Date().toISOString(), tier: price >= 550 ? "premium" : "standard", price, status: "pending", responseAt: null, acceptedAt: null, paymentReceivedAt: null, notes: "" });
        });
        logActivity(l, "offer_sent", `Offered to ${contractorIds.map((cid) => CONTRACTORS.find((c) => c.id === cid).name).join(", ")} at ${fmtMoney(price)}`);
        if (l.currentStage !== "OFFERED") setStage(l, "OFFERED");
        return l;
      });
    });
    setOfferTarget(null);
    setSelection([]);
    toast(`Offer sent for ${leadIds.length} lead${leadIds.length > 1 ? "s" : ""} · 24h response window started`, "success", snapKey);
  }, [leads, patchLead, toast]);

  const respondOffer = useCallback((lead, contractorId, status) => {
    patchLead(lead.id, (l) => {
      const o = l.contractorOffers.find((x) => x.contractorId === contractorId);
      if (!o) return l;
      o.status = status;
      o.responseAt = new Date().toISOString();
      if (status === "accepted") {
        o.acceptedAt = o.responseAt;
        // First to accept wins — close other pending threads
        l.contractorOffers.forEach((x) => { if (x.contractorId !== contractorId && x.status === "pending") { x.status = "declined"; x.responseAt = o.responseAt; } });
        logActivity(l, "offer_accepted", `${o.contractorName} accepted — collect ${fmtMoney(o.price)}`);
        setStage(l, "ACCEPTED");
      } else {
        logActivity(l, "offer_declined", `${o.contractorName} declined`);
      }
      return l;
    });
    setSelectedLead((s) => (s && s.id === lead.id ? null : s)); // will re-open with fresh data below
    if (status === "accepted") toast(`${lead.homeowner.name} accepted by contractor — moved to Accepted`, "success");
  }, [patchLead, toast]);

  const escalate = useCallback((lead, backup) => {
    const price = lead.qualityScore >= 80 ? 600 : lead.qualityScore >= 60 ? 500 : 400;
    patchLead(lead.id, (l) => {
      l.contractorOffers.push({ contractorId: backup.id, contractorName: backup.name, offeredAt: new Date().toISOString(), tier: price >= 550 ? "premium" : "standard", price, status: "pending", responseAt: null, acceptedAt: null, paymentReceivedAt: null, notes: "backup escalation" });
      l.stageEnteredAt = new Date().toISOString(); // reset the response clock
      logActivity(l, "escalated", `Escalated to backup: ${backup.name}`);
      return l;
    });
    toast(`Escalated to ${backup.name} — new 24h window`, "info");
  }, [patchLead, toast]);

  const recordPayment = useCallback((lead) => {
    tryMove(lead.id, "SOLD");
    setSelectedLead(null);
  }, [tryMove]);

  const markLost = useCallback((leadId, reason) => {
    const snapKey = Math.random().toString(36).slice(2);
    undoSnapshots.current[snapKey] = leads;
    patchLead(leadId, (l) => {
      setStage(l, "LOST");
      l.outcome = { result: "lost", closeDate: new Date().toISOString(), revenue: null, contractorWinner: null, lossReason: reason };
      logActivity(l, "marked_lost", reason);
      return l;
    });
    setLostTarget(null);
    setSelectedLead(null);
    toast(`Lead marked lost: ${reason}`, "info", snapKey);
  }, [leads, patchLead, toast]);

  const addNote = useCallback((lead, text) => {
    patchLead(lead.id, (l) => { logActivity(l, "note", text); return l; });
    toast("Note saved to activity log", "success");
  }, [patchLead, toast]);

  const addLead = useCallback((f) => {
    const lead = makeLead({
      homeowner: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), responseTime: f.responseTime },
      project: { type: f.type, budgetMin: Number(f.budgetMin), budgetMax: Number(f.budgetMax), timelineDays: Number(f.timelineDays) },
      source: f.source,
      createdAt: new Date().toISOString(),
      stageEnteredAt: new Date().toISOString(),
      activities: [{ timestamp: new Date().toISOString(), action: "form_submitted", notes: `Lead created (${f.source})`, user: "you" }],
    });
    // Duplicate detection: same phone within 24h
    const dupe = leads.find((l) => l.homeowner.phone.replace(/\D/g, "") === f.phone.replace(/\D/g, "") && Date.now() - new Date(l.createdAt).getTime() < 24 * HOUR);
    setLeads((ls) => [lead, ...ls]);
    setShowAdd(false);
    if (dupe) toast(`Heads up: same phone as ${dupe.homeowner.name} within 24h — possible duplicate.`, "error");
    else toast(`Lead created · score ${lead.qualityScore} · ${lead.qualityScore >= 80 ? "🟢 premium — offer now" : lead.qualityScore >= 60 ? "🟡 qualified range" : "🔴 below qualification bar"}`, lead.qualityScore >= 80 ? "success" : "info");
  }, [leads, toast]);

  /* ----- Selection / bulk ----- */
  const toggleSelect = (id) => setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  /* ----- Filters ----- */
  const visible = useMemo(() => leads.filter((l) =>
    l.qualityScore >= filters.scoreMin &&
    filters.types.includes(l.project.type) &&
    (filters.search === "" || l.homeowner.name.toLowerCase().includes(filters.search.toLowerCase()) || l.id.includes(filters.search))
  ), [leads, filters]);

  /* ----- DnD ----- */
  const onDragStart = (e, lead) => {
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = (e, stageId) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) tryMove(id, stageId);
  };

  /* ----- Stalled alerts banner ----- */
  const stalled = useMemo(() => leads.filter((l) => stallInfo(l, now)), [leads, now]);

  /* ----- Card actions per stage ----- */
  const cardActions = (lead) => {
    const stall = stallInfo(lead, now);
    switch (lead.currentStage) {
      case "NEW":
        return (<>
          <Btn tone="blue" onClick={() => tryMove(lead.id, "QUALIFIED")}>Qualify</Btn>
          <Btn tone="ghost" onClick={() => window.open(`tel:${lead.homeowner.phone}`)}>Call</Btn>
        </>);
      case "QUALIFIED":
        return <Btn tone="blue" onClick={() => setOfferTarget({ leadIds: [lead.id], moveAfter: true })}>Offer to contractors</Btn>;
      case "OFFERED": {
        const offeredIds = lead.contractorOffers.map((o) => o.contractorId);
        const backup = CONTRACTORS.find((c) => !offeredIds.includes(c.id));
        return (<>
          {stall && backup && <Btn tone="amber" onClick={() => escalate(lead, backup)}>Escalate</Btn>}
          <Btn tone="ghost" onClick={() => setSelectedLead(lead)}>Responses</Btn>
        </>);
      }
      case "ACCEPTED":
        return <Btn tone="green" onClick={() => recordPayment(lead)}>Payment received</Btn>;
      case "SOLD":
        return <Btn tone="ghost" onClick={() => setSelectedLead(lead)}>Details</Btn>;
      default:
        return null;
    }
  };

  const offerLead = offerTarget ? leads.find((l) => l.id === offerTarget.leadIds[0]) : null;
  const liveSelected = selectedLead ? leads.find((l) => l.id === selectedLead.id) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-widest text-blue-400">EZXMGMT</span>
          <span className="hidden sm:inline text-[11px] text-slate-500 uppercase tracking-wider">High-ticket pipeline · Tampa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Btn tone={view === "kanban" ? "blue" : "ghost"} onClick={() => setView("kanban")} title="Pipeline"><LayoutGrid className="w-3.5 h-3.5" /></Btn>
          <Btn tone={view === "leaderboard" ? "blue" : "ghost"} onClick={() => setView("leaderboard")} title="Contractor leaderboard"><Trophy className="w-3.5 h-3.5" /></Btn>
          <Btn tone="ghost" onClick={() => downloadFile("ezx-leads.csv", leadsToCsv(visible), "text/csv")} title="Export CSV"><FileDown className="w-3.5 h-3.5" /></Btn>
          <Btn tone="ghost" onClick={() => downloadFile("ezx-leads.json", JSON.stringify(leads, null, 2), "application/json")} title="Export JSON backup"><Download className="w-3.5 h-3.5" /></Btn>
          <Btn tone="ghost" onClick={() => importRef.current?.click()} title="Import JSON backup"><Upload className="w-3.5 h-3.5" /></Btn>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result);
                if (Array.isArray(data) && data.every((d) => d.id && d.homeowner)) { setLeads(data); toast(`Imported ${data.length} leads`, "success"); }
                else toast("Import failed: file isn't a valid leads backup.", "error");
              } catch { toast("Import failed: couldn't parse JSON.", "error"); }
            };
            reader.readAsText(file);
            e.target.value = "";
          }} />
          <button
            onClick={onLogout}
            className="ml-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <MetricsBar leads={leads} now={now} />

      {/* Stall alert strip */}
      {stalled.length > 0 && view === "kanban" && (
        <div className="px-4 py-2 bg-red-950/60 border-b border-red-900 flex items-center gap-2 text-xs text-red-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{stalled.length} lead{stalled.length > 1 ? "s" : ""} stalled in Offered (24h+): {stalled.map((l) => l.homeowner.name).join(", ")} — escalate to backup or call the contractor.</span>
        </div>
      )}

      {view === "leaderboard" ? (
        <ContractorLeaderboard leads={leads} />
      ) : (
        <>
          {/* Filters + actions */}
          <div className="px-4 py-2.5 flex flex-wrap items-center gap-3 border-b border-slate-900">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Search className="w-3.5 h-3.5" />
              <input
                className="bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-100 w-36 focus:border-blue-600 focus:outline-none"
                placeholder="Search name / ID"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              Score ≥ <span className="font-mono text-slate-200 w-6">{filters.scoreMin}</span>
              <input type="range" min="0" max="100" step="5" value={filters.scoreMin}
                onChange={(e) => setFilters((f) => ({ ...f, scoreMin: Number(e.target.value) }))}
                className="accent-blue-600 w-28" />
            </label>
            <div className="flex items-center gap-2">
              {["kitchen", "bathroom", "general"].map((t) => (
                <label key={t} className={`px-2 py-1 rounded-md border text-xs cursor-pointer capitalize ${filters.types.includes(t) ? "border-blue-600 bg-blue-950/40 text-blue-300" : "border-slate-800 text-slate-500"}`}>
                  <input type="checkbox" className="hidden" checked={filters.types.includes(t)}
                    onChange={() => setFilters((f) => ({ ...f, types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t] }))} />
                  {t}
                </label>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {selection.length > 0 && (
                <Btn tone="blue" onClick={() => setOfferTarget({ leadIds: selection, moveAfter: true })}>
                  <Users className="w-3.5 h-3.5 inline mr-1" />Bulk offer ({selection.length})
                </Btn>
              )}
              <Btn tone="green" onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5 inline mr-1" />Add lead</Btn>
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex-1 overflow-x-auto ezx-scroll">
            <div className="flex gap-3 p-4 min-w-max h-full snap-x">
              {STAGES.map((stage) => {
                const cards = visible.filter((l) => l.currentStage === stage.id);
                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
                    onDragLeave={() => setDragOver((d) => (d === stage.id ? null : d))}
                    onDrop={(e) => onDrop(e, stage.id)}
                    className={`w-64 sm:w-72 shrink-0 snap-start rounded-xl border flex flex-col max-h-[calc(100vh-220px)]
                      ${dragOver === stage.id ? "border-blue-500 bg-blue-950/20" : "border-slate-800 bg-slate-900/40"}`}
                  >
                    <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-100">{stage.label}</span>
                        <span className="ml-2 text-xs font-mono text-slate-500">{cards.length}</span>
                      </div>
                      <span className="text-[10px] text-slate-600">{stage.hint}</span>
                    </div>
                    <div className="p-2 overflow-y-auto ezx-scroll flex-1">
                      {cards.length === 0 && (
                        <div className="text-[11px] text-slate-600 text-center py-6 border border-dashed border-slate-800 rounded-lg">
                          Drop a lead here
                        </div>
                      )}
                      {cards.map((lead) => (
                        <LeadCard
                          key={lead.id} lead={lead} now={now}
                          onOpen={setSelectedLead} onDragStart={onDragStart}
                          selected={selection.includes(lead.id)} onToggleSelect={toggleSelect}
                          actions={cardActions(lead)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Lost tally (off-board, analytics only) */}
              <div className="w-52 shrink-0 rounded-xl border border-slate-900 bg-slate-950 p-3 self-start">
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Lost ({leads.filter((l) => l.currentStage === "LOST").length})</div>
                {leads.filter((l) => l.currentStage === "LOST").slice(0, 5).map((l) => (
                  <div key={l.id} className="text-[11px] text-slate-600 py-1 border-b border-slate-900 cursor-pointer hover:text-slate-400" onClick={() => setSelectedLead(l)}>
                    {l.homeowner.name} — {l.outcome.lossReason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals + toasts */}
      {liveSelected && (
        <LeadModal
          lead={liveSelected} now={now}
          onClose={() => setSelectedLead(null)}
          onOfferResponse={respondOffer}
          onPayment={recordPayment}
          onNote={addNote}
          onMoveStage={(lead, s) => { if (s === "LOST") setLostTarget(lead.id); else tryMove(lead.id, s); }}
          onEscalate={escalate}
          onMarkLost={(lead) => setLostTarget(lead.id)}
        />
      )}
      {offerTarget && offerLead && (
        <OfferModal
          lead={offerLead} leadsCount={offerTarget.leadIds.length}
          onConfirm={(contractorIds, price) => sendOffers(offerTarget.leadIds, contractorIds, price)}
          onClose={() => setOfferTarget(null)}
        />
      )}
      {lostTarget && <LostModal onConfirm={(reason) => markLost(lostTarget, reason)} onClose={() => setLostTarget(null)} />}
      {showAdd && <AddLeadModal onConfirm={addLead} onClose={() => setShowAdd(false)} />}
      <Toasts toasts={toasts} onUndo={handleUndo} onDismiss={dismissToast} />
    </div>
  );
}

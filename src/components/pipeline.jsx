import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LogOut, X, Plus, TrendingUp, Filter as FilterIcon, Building2, Download, Upload,
  ChevronRight, ChevronDown, MoreVertical, DollarSign, Target, Percent, UsersRound,
  Home, Briefcase, Trash2, Pencil, LayoutDashboard, Megaphone, Inbox, CheckSquare,
  CalendarDays, BarChart3, Plug, Settings, Zap, PhoneCall, ScanSearch, Send,
  CheckCircle2, Activity, Mail, Award, Calendar, User
} from "lucide-react";
import { G, STAGE_META, HOUR, DAY, money, moneyK, timeAgo, uid } from "../lib/core.js";
import { loadLeads, saveLeads, exportAll, importAll } from "../lib/data.js";

/* ============================================================
   GOLD ENTERPRISE PIPELINE — replica of the ezxmgmt reference
   ============================================================ */

const STAGE_LABELS = { NEW: "NEW LEADS", CONTACTED: "CONTACTED", QUALIFIED: "QUALIFIED", PROPOSAL: "PROPOSAL SENT", WON: "CLOSED WON" };
const KPI_COLORS = { gold: "#F5C842", blue: "#4A90E8", green: "#3DBE7B", purple: "#A96FE8" };

/* ---------- shared small components ---------- */
export function GBtn({ children, onClick, kind = "ghost", className = "", title, disabled }) {
  const styles = {
    gold: { background: "linear-gradient(180deg,#F5C842,#D4AF37)", color: "#141105", border: `1px solid #F5C842`, fontWeight: 700, boxShadow: "0 0 18px rgba(212,175,55,0.35)" },
    ghost: { background: "transparent", color: G.dim, border: `1px solid ${G.border}` },
    dark: { background: G.panel2, color: G.text, border: `1px solid ${G.border}` },
    danger: { background: "transparent", color: "#E8776B", border: "1px solid rgba(232,119,107,0.4)" },
  };
  return (
    <button type="button" title={title} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
      className={`px-3 py-1.5 rounded-md text-xs tracking-wider transition-opacity hover:opacity-80 disabled:opacity-40 ${className}`}
      style={styles[kind]}>
      {children}
    </button>
  );
}

export function dailySeries(leads, days, valueOf) {
  const out = new Array(days).fill(0);
  const start = Date.now() - (days - 1) * DAY;
  leads.forEach((l) => {
    const idx = Math.floor((new Date(l.createdAt).getTime() - start) / DAY);
    if (idx >= 0 && idx < days) out[idx] += valueOf(l);
  });
  return out;
}
export function trendPct(series) {
  const half = Math.floor(series.length / 2);
  const a = series.slice(0, half).reduce((s, v) => s + v, 0);
  const b = series.slice(half).reduce((s, v) => s + v, 0);
  if (a === 0) return b > 0 ? 100 : 0;
  return Math.round(((b - a) / a) * 100);
}

function Sparkline({ points, color, height = 46, area = true }) {
  const max = Math.max(...points, 1);
  const pts = points.map((v, i) => [(i / (points.length - 1)) * 100, 34 - (v / max) * 26]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 36" className="w-full" style={{ height }} preserveAspectRatio="none" aria-hidden="true">
      {area && <path d={`${line} L100,36 L0,36 Z`} fill={color} opacity="0.10" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

/* ---------- header pieces ---------- */
function rangeLabel() {
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const now = new Date(), from = new Date(Date.now() - 30 * DAY);
  return `${fmt(from)} – ${fmt(now)}, ${now.getFullYear()}`;
}
function prevRangeLabel() {
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `vs ${fmt(new Date(Date.now() - 60 * DAY))} – ${fmt(new Date(Date.now() - 31 * DAY))}`;
}

function KpiCard({ icon: Icon, label, value, series, color }) {
  const pct = trendPct(series);
  return (
    <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #100E08, #0B0A06)", border: `1px solid ${G.border}` }}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${color}55`, color, boxShadow: `inset 0 0 12px ${color}18` }}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="tracking-[0.2em] font-medium" style={{ color: G.dim, fontSize: 11 }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="font-bold font-mono" style={{ color, fontSize: 30, textShadow: `0 0 22px ${color}55` }}>{value}</span>
        <span className="font-mono font-semibold" style={{ color: pct >= 0 ? "#3DBE7B" : "#E8776B", fontSize: 13 }}>{pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}%</span>
      </div>
      <div style={{ color: G.faint, fontSize: 10, letterSpacing: "0.08em", marginTop: 2 }}>{prevRangeLabel()}</div>
      <Sparkline points={series} color={color} />
    </div>
  );
}

/* ---------- chevron stage banner ---------- */
function StageBanner({ stage, count, total }) {
  const clip = "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)";
  return (
    <div style={{ filter: `drop-shadow(0 0 8px ${stage.color}66)` }}>
      <div style={{ clipPath: clip, background: stage.color, padding: 1 }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ clipPath: clip, background: `linear-gradient(90deg, ${stage.color}22, #0C0A06 70%)` }}>
          <span className="px-1.5 py-0.5 rounded font-mono font-bold" style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)", background: `${stage.color}22`, border: `1px solid ${stage.color}`, color: stage.color, fontSize: 12 }}>{stage.num}</span>
          <div className="min-w-0">
            <div className="font-bold tracking-[0.12em] truncate" style={{ color: stage.color, fontSize: 12.5, textShadow: `0 0 10px ${stage.color}66` }}>{STAGE_LABELS[stage.id]}</div>
            <div className="font-mono" style={{ color: G.dim, fontSize: 10.5 }}>{count} Leads | {moneyK(total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- lead card ---------- */
function GoldLeadCard({ lead, color, onOpen, onDragStart, onMenu }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onOpen(lead)}
      className="rounded-lg p-3 mb-2 cursor-pointer select-none transition-all group"
      style={{ background: `linear-gradient(180deg, ${color}0C, #0B0A07)`, border: `1px solid ${color}33` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}88`; e.currentTarget.style.boxShadow = `0 0 14px ${color}22`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: `${color}14`, border: `1px solid ${color}55`, color }}>
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ color: G.text, fontSize: 13 }}>{lead.name}</div>
            <div className="truncate" style={{ color: G.faint, fontSize: 11 }}>{lead.category || lead.source}</div>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onMenu(lead, e); }} aria-label="Lead menu"
          className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: G.dim }}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-mono font-bold" style={{ color, fontSize: 14 }}>{money(lead.value)}</span>
        <span className="flex items-center gap-1.5" style={{ color: G.faint, fontSize: 11 }}>
          {timeAgo(lead.stage === "WON" ? lead.stageEnteredAt : lead.createdAt)}
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        </span>
      </div>
    </div>
  );
}

/* ---------- lead modal ---------- */
function GoldLeadModal({ lead, stagePreset, sources, onSave, onDelete, onClose }) {
  const isNew = !lead;
  const [f, setF] = useState(() => lead ? { ...lead } : {
    id: `lead_${uid()}`, name: "", category: "", value: "", phone: "", email: "",
    source: sources[0] || "Website", stage: stagePreset || "NEW",
    createdAt: new Date().toISOString(), stageEnteredAt: new Date().toISOString(),
    notes: "", lost: false, activities: [{ t: new Date().toISOString(), msg: "Lead created" }],
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && Number(f.value) >= 0;
  const field = { width: "100%", background: "#0A0906", border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 12px", color: G.text, fontSize: 13, outline: "none" };
  const lbl = { color: G.dim, fontSize: 11, letterSpacing: "0.12em", display: "block", marginBottom: 4 };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.78)" }} onClick={onClose}>
      <div className="rounded-xl w-full max-w-lg p-6 ezx-fade-in max-h-[92vh] overflow-y-auto ezx-scroll" style={{ background: G.panel, border: `1px solid ${G.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold tracking-widest" style={{ color: G.goldBright, fontSize: 15 }}>{isNew ? "NEW LEAD" : "EDIT LEAD"}</h3>
          <button onClick={onClose} style={{ color: G.dim }} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label style={lbl}>NAME</label><input style={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Lead or company name" /></div>
          <div><label style={lbl}>CATEGORY</label><input style={field} value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Kitchen, SaaS, Membership…" /></div>
          <div><label style={lbl}>VALUE ($)</label><input type="number" style={field} value={f.value} onChange={(e) => set("value", e.target.value)} placeholder="12500" /></div>
          <div><label style={lbl}>PHONE</label><input style={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label style={lbl}>EMAIL</label><input style={field} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label style={lbl}>SOURCE</label>
            <input style={field} value={f.source} list="ezx-sources" onChange={(e) => set("source", e.target.value)} />
            <datalist id="ezx-sources">{sources.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          <div><label style={lbl}>STAGE</label>
            <select style={field} value={f.stage} onChange={(e) => set("stage", e.target.value)}>
              {STAGE_META.map((s) => <option key={s.id} value={s.id}>{s.num} · {STAGE_LABELS[s.id]}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label style={lbl}>NOTES</label>
            <textarea style={{ ...field, minHeight: 70, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        {!isNew && f.activities?.length > 0 && (
          <div className="mt-4">
            <label style={lbl}>ACTIVITY</label>
            <div className="space-y-1 max-h-28 overflow-y-auto ezx-scroll">
              {[...f.activities].reverse().map((a, i) => (
                <div key={i} className="flex gap-2" style={{ fontSize: 11 }}>
                  <span className="font-mono shrink-0" style={{ color: G.faint }}>{new Date(a.t).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  <span style={{ color: G.dim }}>{a.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-5">
          <div>{!isNew && <GBtn kind="danger" onClick={() => onDelete(f.id)}><Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete</GBtn>}</div>
          <div className="flex gap-2">
            <GBtn kind="ghost" onClick={onClose}>Cancel</GBtn>
            <GBtn kind="gold" disabled={!valid} onClick={() => onSave({ ...f, value: Number(f.value) || 0 })}>{isNew ? "+ ADD LEAD" : "SAVE"}</GBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- donut chart ---------- */
function Donut({ segments, total }) {
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
      <svg viewBox="0 0 110 110" width="150" height="150">
        <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        {segments.map((s, i) => {
          const frac = total ? s.count / total : 0;
          const dash = frac * C;
          const el = (
            <circle key={i} cx="55" cy="55" r={R} fill="none" stroke={s.color} strokeWidth="9"
              strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-acc * C + C / 4}
              strokeLinecap="butt" style={{ filter: `drop-shadow(0 0 4px ${s.color}88)` }} />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold font-mono" style={{ color: G.goldBright, fontSize: 26, textShadow: "0 0 16px rgba(245,200,66,0.5)" }}>{total.toLocaleString()}</span>
        <span style={{ color: G.dim, fontSize: 9, letterSpacing: "0.2em" }}>TOTAL LEADS</span>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PIPELINE
   ============================================================ */
export function GoldPipeline({ company, onHome = () => {}, onCompanies = () => {}, onLogout = () => {}, leads: propsLeads, setLeads: propsSetLeads }) {
  const [internalLeads, setInternalLeads] = useState(() => loadLeads(company.id));

  // Use provided leads/setLeads if available, otherwise use internal state
  const leads = propsLeads !== undefined ? propsLeads : internalLeads;
  const setLeads = propsSetLeads !== undefined ? propsSetLeads : setInternalLeads;
  const [modal, setModal] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [showLost, setShowLost] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [q, setQ] = useState("");
  const [minVal, setMinVal] = useState(0);
  const [doneTasks, setDoneTasks] = useState({});
  const importRef = useRef(null);

  useEffect(() => { setLeads(loadLeads(company.id)); }, [company.id]);
  useEffect(() => { saveLeads(company.id, leads); }, [company.id, leads]);
  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const activeAll = useMemo(() => leads.filter((l) => !l.lost), [leads]);
  const active = useMemo(() => activeAll.filter((l) =>
    (!q || l.name.toLowerCase().includes(q.toLowerCase()) || (l.category || "").toLowerCase().includes(q.toLowerCase()))
    && l.value >= minVal), [activeAll, q, minVal]);
  const lost = useMemo(() => leads.filter((l) => l.lost), [leads]);
  const sources = useMemo(() => [...new Set(leads.map((l) => l.source).filter(Boolean))], [leads]);

  const metrics = useMemo(() => {
    const total = active.length;
    const qualified = active.filter((l) => ["QUALIFIED", "PROPOSAL", "WON"].includes(l.stage)).length;
    const won = active.filter((l) => l.stage === "WON");
    const conv = total ? Math.round((won.length / total) * 1000) / 10 : 0;
    const revenue = won.reduce((s, l) => s + l.value, 0);
    const pipelineValue = active.filter((l) => l.stage !== "WON").reduce((s, l) => s + l.value, 0);
    return { total, qualified, conv, revenue, pipelineValue };
  }, [active]);

  const series = useMemo(() => ({
    leads: dailySeries(active, 14, () => 1),
    qualified: dailySeries(active.filter((l) => ["QUALIFIED", "PROPOSAL", "WON"].includes(l.stage)), 14, () => 1),
    conv: dailySeries(active.filter((l) => l.stage === "WON"), 14, () => 1),
    revenue: dailySeries(active.filter((l) => l.stage === "WON"), 14, (l) => l.value),
  }), [active]);

  const sourceBreakdown = useMemo(() => {
    const map = {};
    active.forEach((l) => { map[l.source || "Other"] = (map[l.source || "Other"] || 0) + 1; });
    const colors = ["#A96FE8", "#3DBE7B", "#F5C842", "#4A90E8", "#C084FC"];
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count], i) => ({ name, count, pct: active.length ? Math.round((count / active.length) * 100) : 0, color: colors[i] }));
  }, [active]);

  const overview = useMemo(() => {
    const days = 30;
    const daily = dailySeries(active, days, (l) => l.value);
    let cum = 0;
    const cumSeries = daily.map((v) => (cum += v));
    const max = Math.max(...cumSeries, 1);
    const pts = cumSeries.map((v, i) => [(i / (days - 1)) * 100, 40 - (v / max) * 33]);
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    return { line, area: `${line} L100,40 L0,40 Z`, pct: trendPct(cumSeries) };
  }, [active]);

  const aiScore = useMemo(() => {
    if (!active.length) return 0;
    const convScore = Math.min(50, metrics.conv * 1.25);
    const qualScore = metrics.total ? (metrics.qualified / metrics.total) * 30 : 0;
    const fresh = active.filter((l) => Date.now() - new Date(l.createdAt).getTime() < 7 * DAY).length;
    const freshScore = metrics.total ? (fresh / metrics.total) * 20 : 0;
    return Math.round(convScore + qualScore + freshScore);
  }, [active, metrics]);

  const forecast = useMemo(() => Math.round(metrics.revenue + metrics.pipelineValue * Math.min(0.9, Math.max(0.15, metrics.conv / 100 + 0.25))), [metrics]);

  const activityFeed = useMemo(() => {
    const items = [];
    leads.forEach((l) => (l.activities || []).forEach((a) => items.push({ ...a, lead: l.name })));
    return items.sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 4);
  }, [leads]);

  const latestLead = useMemo(() => [...active].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0], [active]);

  const tasksDue = useMemo(() => {
    const tasks = [];
    active.filter((l) => l.stage === "PROPOSAL" && Date.now() - new Date(l.stageEnteredAt).getTime() > 24 * HOUR)
      .slice(0, 2).forEach((l) => tasks.push({ id: `t_${l.id}_f`, label: `Follow up with ${l.name}`, tag: "High Priority", due: "Due in 1h" }));
    active.filter((l) => l.stage === "QUALIFIED").slice(0, 2 - Math.min(tasks.length, 2) + 1)
      .forEach((l) => tasks.push({ id: `t_${l.id}_p`, label: `Send proposal to ${l.name}`, tag: null, due: "Due in 3h" }));
    return tasks.slice(0, 3);
  }, [active]);

  /* mutations */
  const upsert = (lead) => {
    setLeads((ls) => {
      const exists = ls.some((l) => l.id === lead.id);
      if (!exists) return [lead, ...ls];
      return ls.map((l) => {
        if (l.id !== lead.id) return l;
        const next = { ...lead };
        if (l.stage !== lead.stage) {
          next.stageEnteredAt = new Date().toISOString();
          next.activities = [...(lead.activities || []), { t: next.stageEnteredAt, msg: `Moved ${l.stage} → ${lead.stage}` }];
        }
        return next;
      });
    });
    setModal(null);
  };
  const remove = (id) => { setLeads((ls) => ls.filter((l) => l.id !== id)); setModal(null); };
  const moveStage = (id, toStage) => {
    setLeads((ls) => ls.map((l) => l.id === id && l.stage !== toStage
      ? { ...l, stage: toStage, stageEnteredAt: new Date().toISOString(), activities: [...(l.activities || []), { t: new Date().toISOString(), msg: `Moved ${l.stage} → ${toStage}` }] }
      : l));
  };
  const setLost = (id, val) => setLeads((ls) => ls.map((l) => l.id === id
    ? { ...l, lost: val, activities: [...(l.activities || []), { t: new Date().toISOString(), msg: val ? "Marked lost" : "Restored" }] }
    : l));

  const onDragStart = (e, lead) => { e.dataTransfer.setData("text/plain", lead.id); e.dataTransfer.effectAllowed = "move"; };
  const onDrop = (e, stageId) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveStage(id, stageId);
  };

  /* sidebar nav */
  const NavItem = ({ icon: Icon, label, active: isActive, onClick, badge }) => (
    <button onClick={onClick} disabled={!onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left relative"
      style={{
        color: isActive ? G.goldBright : onClick ? G.dim : "#57523F",
        background: isActive ? "linear-gradient(90deg, rgba(212,175,55,0.14), rgba(212,175,55,0.03))" : "transparent",
        border: isActive ? `1px solid ${G.border}` : "1px solid transparent",
        boxShadow: isActive ? "0 0 16px rgba(212,175,55,0.15)" : "none",
        cursor: onClick ? "pointer" : "default",
        fontSize: 11.5, letterSpacing: "0.22em",
      }}>
      <Icon className="w-4 h-4 shrink-0" /> {label}
      {badge && <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center font-mono" style={{ background: G.gold, color: "#141105", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  const sideCard = { border: `1px solid ${G.borderSoft}`, background: "#0B0A07", borderRadius: 10, padding: "10px 12px" };
  const panelStyle = { background: "linear-gradient(180deg,#0F0D08,#0B0A06)", border: `1px solid ${G.border}`, borderRadius: 12 };
  const stripSteps = [
    { icon: Zap, a: "LEAD CAPTURE", b: "MULTI-CHANNEL" },
    { icon: PhoneCall, a: "CONTACT INITIATED", b: "AUTOMATED" },
    { icon: ScanSearch, a: "LEAD QUALIFIED", b: "AI SCORING" },
    { icon: Send, a: "PROPOSAL SENT", b: "PERSONALIZED" },
    { icon: CheckCircle2, a: "WON / LOST", b: "CLOSED LOOP" },
  ];

  return (
    <div className="min-h-screen flex ezx-fade-in" style={{ background: "#050403", color: G.text }}>
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 p-4 gap-1 sticky top-0 h-screen overflow-y-auto ezx-scroll" style={{ borderRight: `1px solid ${G.borderSoft}`, background: "#070604" }}>
        <div className="flex items-center gap-2 px-2 py-4 mb-1">
          <TrendingUp className="w-6 h-6" style={{ color: G.goldBright, filter: "drop-shadow(0 0 6px rgba(245,200,66,0.6))" }} />
          <span className="font-bold" style={{ color: G.goldBright, fontSize: 21, textShadow: "0 0 18px rgba(245,200,66,0.4)" }}>ezxmgmt</span>
        </div>
        <NavItem icon={LayoutDashboard} label="DASHBOARD" onClick={onHome} />
        <NavItem icon={FilterIcon} label="PIPELINE" active />
        <NavItem icon={UsersRound} label="LEADS" onClick={() => setModal({ stagePreset: "NEW" })} />
        <NavItem icon={Megaphone} label="CAMPAIGNS" />
        <NavItem icon={Inbox} label="INBOX" badge={activityFeed.length || null} />
        <NavItem icon={CheckSquare} label="TASKS" />
        <NavItem icon={CalendarDays} label="CALENDAR" />
        <NavItem icon={BarChart3} label="REPORTS" />
        <NavItem icon={Plug} label="INTEGRATIONS" onClick={() => importRef.current?.click()} />
        <NavItem icon={Settings} label="SETTINGS" onClick={onCompanies} />
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => { try { importAll(reader.result); onCompanies(); } catch { alert("Import failed: not a valid EZXMgmt backup."); } };
          reader.readAsText(file);
          e.target.value = "";
        }} />

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <div style={sideCard}>
            <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.2em" }}>SYSTEM STATUS</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3DBE7B", boxShadow: "0 0 6px #3DBE7B" }} />
              <span style={{ color: G.dim, fontSize: 10.5, letterSpacing: "0.15em" }}>OPERATIONAL</span>
            </div>
            <Sparkline points={[3, 5, 4, 7, 6, 9, 7, 10, 8, 11, 9, 12]} color="#8b8570" height={34} area={false} />
          </div>
          <div style={sideCard} className="flex items-center justify-between">
            <span style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.15em" }}>DATA SYNC<br /><span style={{ color: G.dim }}>REAL-TIME</span></span>
            <span className="font-mono font-bold" style={{ color: "#4A90E8", fontSize: 14 }}>99.98%</span>
          </div>
          <div style={sideCard}>
            <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.2em" }}>PIPELINE VALUE</div>
            <div className="font-mono font-bold" style={{ color: G.goldBright, fontSize: 17 }}>{moneyK(metrics.pipelineValue + metrics.revenue)}</div>
          </div>
          <div style={sideCard}>
            <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.2em" }}>ACTIVE LEADS</div>
            <div className="font-mono font-bold" style={{ color: G.text, fontSize: 17 }}>{metrics.total}</div>
          </div>
          <button onClick={onCompanies} className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg transition-opacity hover:opacity-80 text-left" style={{ border: `1px solid ${G.borderSoft}` }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: "#1A1710", border: `1px solid ${G.border}`, color: G.goldBright, fontSize: 11 }}>
              {company.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold truncate" style={{ color: G.text, fontSize: 12 }}>{company.name}</span>
              <span className="block" style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.2em" }}>ADMIN</span>
            </span>
            <ChevronDown className="w-4 h-4 ml-auto shrink-0" style={{ color: G.dim }} />
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg" style={{ color: "#E8776B", border: "1px solid rgba(232,119,107,0.3)", fontSize: 11, letterSpacing: "0.15em" }}>
            <LogOut className="w-4 h-4" /> LOGOUT
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6" style={{ background: "radial-gradient(1200px 500px at 60% -10%, rgba(212,175,55,0.05), transparent)" }}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="font-bold tracking-[0.08em]" style={{ color: G.goldBright, fontSize: 27, textShadow: "0 0 24px rgba(245,200,66,0.35)" }}>LEAD PIPELINE</h1>
            <p style={{ color: G.faint, fontSize: 10.5, letterSpacing: "0.42em" }}>TRACK. ENGAGE. CONVERT.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onHome} className="lg:hidden px-3 py-2 rounded-md" style={{ border: `1px solid ${G.border}`, color: G.dim }}><Home className="w-4 h-4" /></button>
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg" style={{ border: `1px solid ${G.border}`, background: "#0B0A07" }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: G.gold }} />
              <span className="font-mono" style={{ color: G.dim, fontSize: 11, letterSpacing: "0.1em" }}>{rangeLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: G.faint }} />
            </div>
            <div className="relative">
              <button onClick={() => setFilterOpen((v) => !v)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg" style={{ border: `1px solid ${G.border}`, background: "#0B0A07", color: G.dim, fontSize: 11.5, letterSpacing: "0.15em" }}>
                <FilterIcon className="w-3.5 h-3.5" /> FILTERS
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-30 rounded-xl p-4 w-64 ezx-fade-in" style={{ background: G.panel2, border: `1px solid ${G.border}` }} onClick={(e) => e.stopPropagation()}>
                  <label style={{ color: G.dim, fontSize: 10, letterSpacing: "0.15em" }}>SEARCH</label>
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or category…"
                    style={{ width: "100%", background: "#0A0906", border: `1px solid ${G.border}`, borderRadius: 8, padding: "7px 10px", color: G.text, fontSize: 12, outline: "none", marginTop: 4, marginBottom: 10 }} />
                  <label style={{ color: G.dim, fontSize: 10, letterSpacing: "0.15em" }}>MIN VALUE: {money(minVal)}</label>
                  <input type="range" min="0" max="30000" step="500" value={minVal} onChange={(e) => setMinVal(Number(e.target.value))} className="w-full mt-1" style={{ accentColor: G.gold }} />
                  {lost.length > 0 && <GBtn kind="ghost" className="w-full mt-2" onClick={() => { setShowLost(true); setFilterOpen(false); }}>LOST LEADS ({lost.length})</GBtn>}
                </div>
              )}
            </div>
            <button onClick={() => setModal({ stagePreset: "NEW" })}
              className="px-4 py-2 rounded-lg font-bold tracking-[0.15em] transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(180deg,#F5C842,#C9A227)", color: "#141105", fontSize: 12, border: "1px solid #F5C842", boxShadow: "0 0 22px rgba(212,175,55,0.45)" }}>
              + NEW LEAD
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <KpiCard icon={UsersRound} label="TOTAL LEADS" value={metrics.total.toLocaleString()} series={series.leads} color={KPI_COLORS.gold} />
          <KpiCard icon={Target} label="QUALIFIED LEADS" value={metrics.qualified.toLocaleString()} series={series.qualified} color={KPI_COLORS.blue} />
          <KpiCard icon={Percent} label="CONVERSION RATE" value={`${metrics.conv}%`} series={series.conv} color={KPI_COLORS.green} />
          <KpiCard icon={DollarSign} label="CLOSED REVENUE" value={moneyK(metrics.revenue)} series={series.revenue} color={KPI_COLORS.purple} />
        </div>

        {/* ============ KANBAN ============ */}
        <div className="overflow-x-auto ezx-scroll pb-2">
          <div className="flex gap-3 min-w-max">
            {STAGE_META.map((stage) => {
              const cards = active.filter((l) => l.stage === stage.id);
              const total = cards.reduce((s, l) => s + l.value, 0);
              return (
                <div key={stage.id} className="w-64 sm:w-72 shrink-0 flex flex-col gap-2">
                  <StageBanner stage={stage} count={cards.length} total={total} />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
                    onDragLeave={() => setDragOver((d) => (d === stage.id ? null : d))}
                    onDrop={(e) => onDrop(e, stage.id)}
                    className="rounded-xl flex flex-col flex-1"
                    style={{
                      background: dragOver === stage.id ? `${stage.color}14` : `linear-gradient(180deg, ${stage.color}08, #0A0906)`,
                      border: `1px solid ${dragOver === stage.id ? stage.color : `${stage.color}33`}`,
                      boxShadow: dragOver === stage.id ? `0 0 18px ${stage.color}33` : "none",
                      maxHeight: "calc(100vh - 420px)", minHeight: 300,
                    }}>
                    <div className="p-2 overflow-y-auto ezx-scroll flex-1">
                      {cards.map((lead) => (
                        <GoldLeadCard key={lead.id} lead={lead} color={stage.color}
                          onOpen={(l) => setModal({ lead: l })}
                          onDragStart={onDragStart}
                          onMenu={(l, e) => setMenuFor({ lead: l, x: e.clientX, y: e.clientY })} />
                      ))}
                      {cards.length === 0 && (
                        <div className="text-center py-6 rounded-lg m-1" style={{ border: `1px dashed ${stage.color}33`, color: G.faint, fontSize: 11 }}>Drop a lead here</div>
                      )}
                    </div>
                    <button onClick={() => setModal({ stagePreset: stage.id })}
                      className="m-2 py-2 rounded-lg tracking-[0.2em] transition-colors font-semibold"
                      style={{ border: `1px dashed ${stage.color}55`, color: stage.color, fontSize: 11 }}>
                      + ADD LEAD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ ANALYTICS ROW ============ */}
        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {/* Pipeline overview */}
          <div className="p-4" style={{ ...panelStyle, gridColumn: "span 1" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="tracking-[0.2em] font-medium" style={{ color: G.dim, fontSize: 11 }}>PIPELINE OVERVIEW</span>
              <span className="px-2.5 py-1 rounded-md font-mono" style={{ border: `1px solid ${G.border}`, color: G.gold, fontSize: 10, letterSpacing: "0.1em" }}>PIPELINE VALUE ▾</span>
            </div>
            <div className="font-bold font-mono" style={{ color: G.goldBright, fontSize: 28, textShadow: "0 0 20px rgba(245,200,66,0.4)" }}>{moneyK(metrics.pipelineValue + metrics.revenue)}</div>
            <div style={{ color: G.faint, fontSize: 10, letterSpacing: "0.1em" }}>TOTAL PIPELINE VALUE
              <span className="font-mono font-semibold ml-2" style={{ color: overview.pct >= 0 ? "#3DBE7B" : "#E8776B" }}>{overview.pct >= 0 ? "↑" : "↓"} {Math.abs(overview.pct)}%</span>
            </div>
            <svg viewBox="0 0 100 40" className="w-full mt-2" style={{ height: 110 }} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5C842" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F5C842" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={overview.area} fill="url(#goldFill)" />
              <path d={overview.line} fill="none" stroke="#F5C842" strokeWidth="1.3" style={{ filter: "drop-shadow(0 0 4px rgba(245,200,66,0.8))" }} />
            </svg>
          </div>

          {/* Top lead sources */}
          <div className="p-4" style={panelStyle}>
            <div className="tracking-[0.2em] font-medium mb-2" style={{ color: G.dim, fontSize: 11 }}>TOP LEAD SOURCES</div>
            <div className="flex items-center gap-4 flex-wrap">
              <Donut segments={sourceBreakdown} total={active.length} />
              <div className="flex-1 min-w-[140px]">
                {sourceBreakdown.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 mb-2" style={{ fontSize: 11 }}>
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                    <span className="truncate" style={{ color: G.text, letterSpacing: "0.06em" }}>{s.name.toUpperCase()}</span>
                    <span className="font-mono ml-auto" style={{ color: s.color }}>{s.pct}% <span style={{ color: G.faint }}>({s.count})</span></span>
                  </div>
                ))}
                {sourceBreakdown.length === 0 && <p style={{ color: G.faint, fontSize: 12 }}>Add leads to see sources.</p>}
              </div>
            </div>
          </div>

          {/* Intelligence + forecast */}
          <div className="flex flex-col gap-3">
            <div className="p-4 flex-1" style={panelStyle}>
              <div className="tracking-[0.2em] font-medium mb-2" style={{ color: G.dim, fontSize: 11 }}>PIPELINE INTELLIGENCE</div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-9 h-9" style={{ color: G.goldBright, filter: "drop-shadow(0 0 8px rgba(245,200,66,0.7))" }} />
                <div>
                  <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.2em" }}>AI SCORE</div>
                  <div className="font-bold font-mono" style={{ color: G.goldBright, fontSize: 30, lineHeight: 1 }}>{aiScore}</div>
                  <div style={{ color: aiScore >= 60 ? "#3DBE7B" : G.dim, fontSize: 9.5, letterSpacing: "0.2em" }}>{aiScore >= 60 ? "HIGH POTENTIAL" : aiScore >= 30 ? "BUILDING" : "EARLY STAGE"}</div>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1" style={panelStyle}>
              <div className="tracking-[0.2em] font-medium mb-1" style={{ color: G.dim, fontSize: 11 }}>FORECAST</div>
              <div className="font-bold font-mono" style={{ color: G.goldBright, fontSize: 24, textShadow: "0 0 16px rgba(245,200,66,0.4)" }}>{moneyK(forecast)}</div>
              <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.15em" }}>PROJECTED REVENUE
                <span className="font-mono font-semibold ml-2" style={{ color: "#3DBE7B" }}>↑ {Math.max(0, trendPct(series.revenue))}% vs last 30 days</span>
              </div>
              <Sparkline points={series.revenue.some((v) => v > 0) ? series.revenue : [1, 2, 2, 3, 2, 4, 3, 5]} color="#F5C842" height={40} />
            </div>
          </div>
        </div>

        {/* ============ PROCESS STRIP ============ */}
        <div className="mt-4 p-4 flex flex-wrap items-center justify-between gap-4" style={panelStyle}>
          {stripSteps.map((s, i) => (
            <div key={s.a} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ border: `1px solid ${G.border}`, color: G.goldBright, boxShadow: "inset 0 0 14px rgba(212,175,55,0.12)" }}>
                <s.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div style={{ color: G.text, fontSize: 11, letterSpacing: "0.14em", fontWeight: 600 }}>{s.a}</div>
                <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: "0.18em" }}>{s.b}</div>
              </div>
              {i < stripSteps.length - 1 && <ChevronRight className="w-4 h-4 hidden xl:block" style={{ color: "#3a3628", marginLeft: 8 }} />}
            </div>
          ))}
        </div>

        {/* ============ BOTTOM ROW ============ */}
        <div className="grid gap-3 mt-4 mb-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {/* Recent lead activity */}
          <div className="p-4" style={panelStyle}>
            <div className="tracking-[0.2em] font-medium mb-3" style={{ color: G.dim, fontSize: 11 }}>RECENT LEAD ACTIVITY</div>
            {latestLead ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ border: `1px solid ${G.border}`, color: G.gold }}>
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ color: G.gold, fontSize: 10, letterSpacing: "0.15em" }}>NEW LEAD FROM {(latestLead.source || "WEBSITE").toUpperCase()}</div>
                  <div className="font-semibold truncate" style={{ color: G.text, fontSize: 14 }}>{latestLead.name}</div>
                  <div className="flex items-center gap-2" style={{ color: G.faint, fontSize: 11 }}>
                    {latestLead.category || "—"}
                    <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(74,144,232,0.15)", color: "#4A90E8", fontSize: 9 }}>{STAGE_LABELS[latestLead.stage] || latestLead.stage}</span>
                    {timeAgo(latestLead.createdAt)}
                  </div>
                </div>
                <div className="text-center">
                  <div style={{ color: G.faint, fontSize: 9, letterSpacing: "0.2em" }}>LEAD VALUE</div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold mt-1 mx-auto" style={{ border: `2px solid ${G.gold}`, color: G.goldBright, fontSize: 11, boxShadow: "0 0 14px rgba(212,175,55,0.4)" }}>
                    {moneyK(latestLead.value)}
                  </div>
                </div>
              </div>
            ) : <p style={{ color: G.faint, fontSize: 12 }}>No leads yet — add your first.</p>}
          </div>

          {/* Tasks due */}
          <div className="p-4" style={panelStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="tracking-[0.2em] font-medium" style={{ color: G.dim, fontSize: 11 }}>TASKS DUE</span>
              <span style={{ color: G.gold, fontSize: 10, letterSpacing: "0.15em" }}>VIEW ALL</span>
            </div>
            {tasksDue.map((t) => (
              <label key={t.id} className="flex items-center gap-3 py-2 cursor-pointer" style={{ borderBottom: `1px solid ${G.borderSoft}` }}>
                <input type="checkbox" checked={!!doneTasks[t.id]} onChange={() => setDoneTasks((d) => ({ ...d, [t.id]: !d[t.id] }))}
                  className="w-4 h-4 rounded" style={{ accentColor: G.gold }} />
                <span className="flex-1 min-w-0 truncate" style={{ color: doneTasks[t.id] ? G.faint : G.text, fontSize: 12.5, textDecoration: doneTasks[t.id] ? "line-through" : "none" }}>{t.label}</span>
                {t.tag && <span style={{ color: "#E8776B", fontSize: 10, fontWeight: 600 }}>{t.tag}</span>}
                <span className="font-mono shrink-0" style={{ color: G.faint, fontSize: 10.5 }}>{t.due}</span>
              </label>
            ))}
            {tasksDue.length === 0 && <p style={{ color: G.faint, fontSize: 12 }}>All clear — no tasks due.</p>}
          </div>

          {/* Activity feed */}
          <div className="p-4" style={panelStyle}>
            <div className="tracking-[0.2em] font-medium mb-3" style={{ color: G.dim, fontSize: 11 }}>ACTIVITY FEED</div>
            {activityFeed.map((a, i) => {
              const Icon = /won|Moved.*WON/i.test(a.msg) ? Award : /created/i.test(a.msg) ? CheckCircle2 : /lost/i.test(a.msg) ? X : Mail;
              return (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: G.gold }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate" style={{ color: G.text, fontSize: 12 }}>{a.msg}</div>
                    <div className="truncate" style={{ color: G.faint, fontSize: 10.5 }}>{a.lead}</div>
                  </div>
                  <span className="font-mono shrink-0" style={{ color: G.faint, fontSize: 10 }}>{timeAgo(a.t)}</span>
                </div>
              );
            })}
            {activityFeed.length === 0 && <p style={{ color: G.faint, fontSize: 12 }}>No activity yet.</p>}
            <div className="mt-2 text-center py-1.5 rounded-lg" style={{ border: `1px solid ${G.border}`, color: G.gold, fontSize: 10, letterSpacing: "0.2em" }}>VIEW ALL ACTIVITY</div>
          </div>
        </div>
      </main>

      {/* Card kebab menu */}
      {menuFor && (
        <div className="fixed z-50 rounded-lg overflow-hidden ezx-fade-in" style={{ top: Math.min(menuFor.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 140), left: Math.min(menuFor.x - 130, (typeof window !== "undefined" ? window.innerWidth : 1200) - 160), background: G.panel2, border: `1px solid ${G.border}`, minWidth: 150 }}
          onClick={(e) => e.stopPropagation()}>
          <button className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:opacity-70" style={{ color: G.text, fontSize: 12 }}
            onClick={() => { setModal({ lead: menuFor.lead }); setMenuFor(null); }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
          <button className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:opacity-70" style={{ color: "#E8963C", fontSize: 12 }}
            onClick={() => { setLost(menuFor.lead.id, true); setMenuFor(null); }}><X className="w-3.5 h-3.5" /> Mark lost</button>
          <button className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:opacity-70" style={{ color: "#E8776B", fontSize: 12 }}
            onClick={() => { remove(menuFor.lead.id); setMenuFor(null); }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>
      )}

      {/* Lost list modal */}
      {showLost && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.78)" }} onClick={() => setShowLost(false)}>
          <div className="rounded-xl w-full max-w-md p-5 ezx-fade-in" style={{ background: G.panel, border: `1px solid ${G.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold tracking-widest" style={{ color: G.goldBright, fontSize: 14 }}>LOST LEADS</h3>
              <button onClick={() => setShowLost(false)} style={{ color: G.dim }} aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            {lost.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${G.borderSoft}` }}>
                <div>
                  <div style={{ color: G.text, fontSize: 13 }}>{l.name}</div>
                  <div className="font-mono" style={{ color: G.faint, fontSize: 11 }}>{money(l.value)}</div>
                </div>
                <GBtn kind="dark" onClick={() => setLost(l.id, false)}>Restore</GBtn>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <GoldLeadModal
          lead={modal.lead || null}
          stagePreset={modal.stagePreset}
          sources={sources.length ? sources : ["Website", "Google Ads", "Referral", "Instagram"]}
          onSave={upsert} onDelete={remove} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

import React from "react";
import { X, Undo2 } from "lucide-react";
import { HEALTH_DOT } from "../utils/constants.js";

/* ---------- Sparkline ---------- */
export function Sparkline({ points, color, height = 46, area = true }) {
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

/* ---------- Small UI atoms ---------- */
export function Dot({ tone }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${HEALTH_DOT[tone]}`} />;
}

export function Btn({ children, onClick, tone = "slate", className = "", title, disabled }) {
  const tones = {
    slate: "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700",
    blue: "bg-blue-700 hover:bg-blue-600 text-white border-blue-600",
    green: "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600",
    red: "bg-red-700 hover:bg-red-600 text-white border-red-600",
    amber: "bg-amber-700 hover:bg-amber-600 text-white border-amber-600",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700",
  };
  return (
    <button
      type="button" title={title} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
      className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------- Toast host ---------- */
export function Toasts({ toasts, onUndo, onDismiss }) {
  return (
    <div className="fixed top-16 right-3 z-50 space-y-2 w-72 max-w-[90vw]">
      {toasts.map((t) => (
        <div key={t.id} className={`ezx-fade-in rounded-lg border px-3 py-2.5 text-sm shadow-lg flex items-start gap-2
          ${t.tone === "error" ? "bg-red-950 border-red-700 text-red-200" : t.tone === "success" ? "bg-emerald-950 border-emerald-700 text-emerald-200" : "bg-slate-800 border-slate-600 text-slate-200"}`}>
          <span className="flex-1">{t.msg}</span>
          {t.undo && <button onClick={() => onUndo(t)} className="text-blue-400 font-semibold text-xs hover:underline flex items-center gap-1"><Undo2 className="w-3 h-3" />Undo</button>}
          <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-white" aria-label="Dismiss"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}

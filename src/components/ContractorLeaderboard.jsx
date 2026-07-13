import React, { useMemo } from "react";
import { Trophy } from "lucide-react";
import { CONTRACTORS } from "../data/contractorList.js";
import { fmtMoney } from "../utils/formatting.js";

/* ---------- Contractor leaderboard ---------- */
export function ContractorLeaderboard({ leads }) {
  const rows = useMemo(() => {
    return CONTRACTORS.map((c) => {
      const offers = leads.flatMap((l) => l.contractorOffers.filter((o) => o.contractorId === c.id).map((o) => ({ o, l })));
      const sent = offers.length;
      const sold = offers.filter(({ o }) => o.status === "accepted" && o.paymentReceivedAt).length;
      const accepted = offers.filter(({ o }) => o.status === "accepted").length;
      const revenue = offers.filter(({ o }) => o.paymentReceivedAt).reduce((s, { o }) => s + o.price, 0);
      const rate = sent ? Math.round((accepted / sent) * 100) : 0;
      return { c, sent, accepted, sold, rate, revenue };
    }).sort((a, b) => b.rate - a.rate || b.revenue - a.revenue);
  }, [leads]);

  return (
    <div className="p-4 max-w-3xl mx-auto ezx-fade-in">
      <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Contractor performance</h2>
      <div className="overflow-x-auto ezx-scroll rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 bg-slate-900">
              <th className="px-3 py-2">#</th><th className="px-3 py-2">Contractor</th>
              <th className="px-3 py-2 text-right">Offered</th><th className="px-3 py-2 text-right">Accepted</th>
              <th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.c.id} className="border-t border-slate-800 bg-slate-900/50">
                <td className="px-3 py-2.5 font-mono text-slate-400">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-100">{r.c.name}</td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-300">{r.sent}</td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-300">{r.accepted}</td>
                <td className={`px-3 py-2.5 text-right font-mono font-bold ${r.rate >= 55 ? "text-emerald-400" : r.rate >= 40 ? "text-amber-400" : "text-red-400"}`}>{r.rate}%</td>
                <td className="px-3 py-2.5 text-right font-mono text-emerald-400">{fmtMoney(r.revenue)}</td>
                <td className="px-3 py-2.5 text-[11px] text-slate-400 capitalize">{r.c.specialties.join(", ")} · ~{r.c.avgResponseTime}m resp</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 mt-2">Rate = accepted ÷ offered. Rankings update in real time as offers resolve.</p>
    </div>
  );
}

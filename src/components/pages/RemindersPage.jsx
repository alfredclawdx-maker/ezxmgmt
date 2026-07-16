import { G } from '../../lib/core.js';

export function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold tracking-[0.08em]" style={{ color: G.goldBright, fontSize: 27, textShadow: '0 0 24px rgba(245,200,66,0.35)' }}>REMINDERS</h1>
        <p style={{ color: G.faint, fontSize: 10.5, letterSpacing: '0.42em', marginTop: 4 }}>NOTIFICATIONS & ALERTS</p>
      </div>
      <div className="rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]" style={{ border: `1px solid ${G.border}`, background: 'linear-gradient(180deg,#0F0D08,#0B0A06)' }}>
        <div style={{ color: G.gold, fontSize: 48, marginBottom: 16 }}>🔔</div>
        <h2 style={{ color: G.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Coming Soon</h2>
        <p style={{ color: G.dim, fontSize: 13, textAlign: 'center' }}>Reminders feature is being developed</p>
      </div>
    </div>
  );
}

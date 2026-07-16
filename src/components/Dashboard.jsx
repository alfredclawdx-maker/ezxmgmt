import { useMemo } from 'react';
import { Calendar, TrendingUp, Target, Check } from 'lucide-react';

const panel = { background: '#000000', border: '1px solid #2C2C2E', borderRadius: 18 };
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/* EZX MGMT brand logo (public/logo.png) — the only colored element on this page */
function EzxLogo() {
  return (
    <img
      src="/logo.png"
      alt="EZX MGMT"
      style={{ width: 400, maxWidth: '80%', height: 'auto' }}
      draggable={false}
    />
  );
}

function MonthGrid({ loggedSet }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayKey = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center" style={{ color: '#98989D', fontSize: 12, letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-4 gap-x-2">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span style={{ color: '#8E8E93', fontSize: 13 }}>{day}</span>
              {loggedSet.has(dayKey(day)) ? (
                <span
                  className="flex items-center justify-center"
                  style={{ width: 22, height: 22, borderRadius: 6, background: '#FFFFFF' }}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: '#000000' }} strokeWidth={3} />
                </span>
              ) : (
                <span style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #48484A' }} />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, unit, last }) {
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: last ? 'none' : '1px solid #2C2C2E' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 12, background: '#1C1C1E' }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
        </span>
        <span style={{ color: '#F2F2F2', fontSize: 15 }}>{label}</span>
      </div>
      <div className="text-right">
        <div style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ color: '#8E8E93', fontSize: 13 }}>{unit}</div>
      </div>
    </div>
  );
}

export function Dashboard({ logins = [], stats = {} }) {
  const loggedSet = useMemo(() => new Set(logins), [logins]);

  return (
    <div className="min-h-full flex flex-col xl:flex-row gap-4">
      {/* Center welcome panel */}
      <section className="flex-1 min-h-[420px] flex flex-col items-center justify-center p-8" style={panel}>
        <p style={{ color: '#98989D', fontSize: 22 }}>Welcome back</p>
        <h1 className="text-center" style={{ color: '#FFFFFF', fontSize: 46, fontWeight: 600, marginTop: 8 }}>
          Glad to see you again.
        </h1>
        <div style={{ marginTop: 72 }}>
          <EzxLogo />
        </div>
      </section>

      {/* Right column */}
      <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-4">
        <section className="p-6" style={panel}>
          <h2
            className="pb-3 mb-5"
            style={{ color: '#F2F2F2', fontSize: 19, letterSpacing: '0.06em', borderBottom: '1px solid #3A3A3C' }}
          >
            DAILY LOGIN TRACKER
          </h2>
          <MonthGrid loggedSet={loggedSet} />
        </section>

        <section className="p-6 flex-1" style={panel}>
          <h2
            className="pb-3 mb-2"
            style={{ color: '#F2F2F2', fontSize: 19, letterSpacing: '0.06em', borderBottom: '1px solid #3A3A3C' }}
          >
            SUMMARY
          </h2>
          <SummaryRow icon={Calendar} label="Current Streak" value={stats.currentStreak ?? 0} unit="days" />
          <SummaryRow icon={TrendingUp} label="Longest Streak" value={stats.longestStreak ?? 0} unit="days" />
          <SummaryRow icon={Target} label="Monthly Logins" value={stats.monthlyLogins ?? 0} unit="times" last />
        </section>
      </div>
    </div>
  );
}

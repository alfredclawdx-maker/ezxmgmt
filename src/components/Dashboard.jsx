import { BarChart3, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { G, money, moneyK } from '../lib/core.js';

function KpiCard({ icon: Icon, label, value, color, trend = 0 }) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #100E08, #0B0A06)', border: `1px solid ${G.border}` }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            border: `1px solid ${color}55`,
            color,
            boxShadow: `inset 0 0 12px ${color}18`
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="tracking-[0.2em] font-medium" style={{ color: G.dim, fontSize: 11 }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span
          className="font-bold font-mono"
          style={{ color, fontSize: 30, textShadow: `0 0 22px ${color}55` }}
        >
          {value}
        </span>
        <span
          className="font-mono font-semibold"
          style={{ color: trend >= 0 ? '#3DBE7B' : '#E8776B', fontSize: 13 }}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

export function Dashboard({ profile, metrics = {} }) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <p style={{ color: G.faint, fontSize: 13, letterSpacing: '0.1em', marginBottom: 8 }}>Welcome back</p>
        <h1
          className="font-bold tracking-[0.08em]"
          style={{
            color: G.goldBright,
            fontSize: 36,
            textShadow: '0 0 24px rgba(245,200,66,0.35)',
            marginBottom: 2
          }}
        >
          Glad to see you again{profile?.name ? ', ' + profile.name.split(' ')[0] : ''}.
        </h1>
        <p style={{ color: G.dim, fontSize: 14, letterSpacing: '0.05em' }}>
          {profile?.role || 'Manager'} · Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="TOTAL LEADS"
          value={metrics.total || 0}
          color="#F5C842"
          trend={12}
        />
        <KpiCard
          icon={BarChart3}
          label="QUALIFIED LEADS"
          value={metrics.qualified || 0}
          color="#4A90E8"
          trend={8}
        />
        <KpiCard
          icon={Percent}
          label="CONVERSION RATE"
          value={`${metrics.conversionRate || 0}%`}
          color="#3DBE7B"
          trend={5}
        />
        <KpiCard
          icon={DollarSign}
          label="CLOSED REVENUE"
          value={moneyK(metrics.revenue || 0)}
          color="#A96FE8"
          trend={15}
        />
      </div>

      {/* Login Tracker Section */}
      <div
        className="rounded-xl p-6"
        style={{ border: `1px solid ${G.border}`, background: 'linear-gradient(180deg,#0F0D08,#0B0A06)' }}
      >
        <h2 style={{ color: G.goldBright, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          DAILY LOGIN TRACKER
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 16
          }}
        >
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} style={{ textAlign: 'center' }}>
              <div style={{ color: G.dim, fontSize: 10, marginBottom: 8, letterSpacing: '0.1em' }}>
                {day}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8
          }}
        >
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                background: i % 3 === 0 ? '#1A1710' : 'transparent',
                border: `1px solid ${G.border}`,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="hover:bg-opacity-50"
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: i % 3 === 0 ? G.goldBright : G.faint,
                  fontSize: 11,
                  fontWeight: 500
                }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div
        className="rounded-xl p-6"
        style={{ border: `1px solid ${G.border}`, background: 'linear-gradient(180deg,#0F0D08,#0B0A06)' }}
      >
        <h2 style={{ color: G.goldBright, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          SUMMARY
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4" style={{ background: '#0B0A07', borderRadius: 8 }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: '#1A1710', color: G.goldBright }}
              >
                📅
              </div>
              <span style={{ color: G.text, fontSize: 13 }}>Current Streak</span>
            </div>
            <span
              className="font-mono font-bold"
              style={{ color: G.goldBright, fontSize: 18 }}
            >
              0 <span style={{ fontSize: 11, color: G.dim }}>days</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-4" style={{ background: '#0B0A07', borderRadius: 8 }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: '#1A1710', color: G.goldBright }}
              >
                📈
              </div>
              <span style={{ color: G.text, fontSize: 13 }}>Longest Streak</span>
            </div>
            <span
              className="font-mono font-bold"
              style={{ color: G.goldBright, fontSize: 18 }}
            >
              0 <span style={{ fontSize: 11, color: G.dim }}>days</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-4" style={{ background: '#0B0A07', borderRadius: 8 }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: '#1A1710', color: G.goldBright }}
              >
                👁️
              </div>
              <span style={{ color: G.text, fontSize: 13 }}>Monthly Logins</span>
            </div>
            <span
              className="font-mono font-bold"
              style={{ color: G.goldBright, fontSize: 18 }}
            >
              0 <span style={{ fontSize: 11, color: G.dim }}>times</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

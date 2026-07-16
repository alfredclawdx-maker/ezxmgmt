import { TrendingUp, LogOut, LayoutDashboard, BarChart3, FilterIcon, CheckSquare, CalendarDays, Settings, Zap } from 'lucide-react';
import { G } from '../lib/core.js';
import { NavItem } from './sidebar/NavItem.jsx';
import { ProfileCard } from './sidebar/ProfileCard.jsx';
import { Sparkline } from './ui.jsx';

export function Sidebar({ activeTab, onNavigate, onLogout, profile, updateProfile, metrics }) {
  const sideCard = { border: `1px solid ${G.borderSoft}`, background: '#0B0A07', borderRadius: 10, padding: '10px 12px' };

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 p-4 gap-1 sticky top-0 h-screen overflow-y-auto ezx-scroll"
      style={{ borderRight: `1px solid ${G.borderSoft}`, background: '#070604' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-4 mb-1">
        <TrendingUp
          className="w-6 h-6"
          style={{
            color: G.goldBright,
            filter: 'drop-shadow(0 0 6px rgba(245,200,66,0.6))'
          }}
        />
        <span
          className="font-bold"
          style={{
            color: G.goldBright,
            fontSize: 21,
            textShadow: '0 0 18px rgba(245,200,66,0.4)'
          }}
        >
          ezxmgmt
        </span>
      </div>

      {/* Nav Items */}
      <NavItem
        icon={LayoutDashboard}
        label="OVERVIEW"
        active={activeTab === 'dashboard'}
        onClick={() => onNavigate('dashboard')}
      />
      <NavItem
        icon={BarChart3}
        label="LOGIN TRACKER"
        active={activeTab === 'login-tracker'}
        onClick={() => onNavigate('login-tracker')}
      />
      <NavItem
        icon={BarChart3}
        label="ANALYTICS"
        active={activeTab === 'analytics'}
        onClick={() => onNavigate('analytics')}
      />
      <NavItem
        icon={FilterIcon}
        label="PIPELINE"
        active={activeTab === 'pipeline'}
        onClick={() => onNavigate('pipeline')}
      />
      <NavItem
        icon={CheckSquare}
        label="TO DO"
        active={activeTab === 'to-do'}
        onClick={() => onNavigate('to-do')}
      />
      <NavItem
        icon={BarChart3}
        label="AD SPEND"
        active={activeTab === 'ad-spend'}
        onClick={() => onNavigate('ad-spend')}
      />
      <NavItem
        icon={CalendarDays}
        label="CALENDAR"
        active={activeTab === 'calendar'}
        onClick={() => onNavigate('calendar')}
      />
      <NavItem
        icon={Settings}
        label="REMINDERS"
        active={activeTab === 'reminders'}
        onClick={() => onNavigate('reminders')}
      />
      <NavItem
        icon={Settings}
        label="SETTINGS"
        active={activeTab === 'settings'}
        onClick={() => onNavigate('settings')}
      />

      {/* Spacer */}
      <div className="mt-auto flex flex-col gap-2 pt-3">
        {/* System Status */}
        <div style={sideCard}>
          <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: '0.2em' }}>SYSTEM STATUS</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#3DBE7B', boxShadow: '0 0 6px #3DBE7B' }}
            />
            <span style={{ color: G.dim, fontSize: 10.5, letterSpacing: '0.15em' }}>OPERATIONAL</span>
          </div>
          <Sparkline points={[3, 5, 4, 7, 6, 9, 7, 10, 8, 11, 9, 12]} color="#8b8570" height={34} area={false} />
        </div>

        {/* Data Sync */}
        <div style={sideCard} className="flex items-center justify-between">
          <span style={{ color: G.faint, fontSize: 9.5, letterSpacing: '0.15em' }}>
            DATA SYNC<br />
            <span style={{ color: G.dim }}>REAL-TIME</span>
          </span>
          <span className="font-mono font-bold" style={{ color: '#4A90E8', fontSize: 14 }}>99.98%</span>
        </div>

        {/* Pipeline Value */}
        <div style={sideCard}>
          <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: '0.2em' }}>PIPELINE VALUE</div>
          <div className="font-mono font-bold" style={{ color: G.goldBright, fontSize: 17 }}>
            {metrics?.pipelineValue ? `$${(metrics.pipelineValue / 1000).toFixed(1)}K` : '$0'}
          </div>
        </div>

        {/* Active Leads */}
        <div style={sideCard}>
          <div style={{ color: G.faint, fontSize: 9.5, letterSpacing: '0.2em' }}>ACTIVE LEADS</div>
          <div className="font-mono font-bold" style={{ color: G.text, fontSize: 17 }}>
            {metrics?.total || 0}
          </div>
        </div>

        {/* Profile Card */}
        <ProfileCard profile={profile} onEditProfile={updateProfile} />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            color: '#E8776B',
            border: '1px solid rgba(232,119,107,0.3)',
            fontSize: 11,
            letterSpacing: '0.15em'
          }}
        >
          <LogOut className="w-4 h-4" /> LOGOUT
        </button>
      </div>
    </aside>
  );
}

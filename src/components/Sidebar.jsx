import {
  LayoutGrid, Home, TrendingUp, PieChart, LineChart, CheckSquare,
  DollarSign, Calendar, Bell, Settings, LogOut
} from 'lucide-react';
import { NavItem } from './sidebar/NavItem.jsx';
import { ProfileCard } from './sidebar/ProfileCard.jsx';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'login-tracker', label: 'Login Tracker', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'pipeline', label: 'Pipeline', icon: LineChart },
  { id: 'to-do', label: 'To Do', icon: CheckSquare },
  { id: 'ad-spend', label: 'Ad Spend', icon: DollarSign },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onNavigate, onLogout, profile, updateProfile }) {
  return (
    <aside
      className="hidden lg:flex flex-col w-72 shrink-0 rounded-2xl p-4 overflow-y-auto ezx-scroll"
      style={{ background: '#030303', border: '1px solid #2C2C2E' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-3">
        <LayoutGrid className="w-5 h-5 text-white" strokeWidth={1.75} />
        <span className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '0.18em' }}>
          DASHBOARD
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onNavigate(tab.id)}
          />
        ))}
      </nav>

      {/* Bottom: profile + sign out */}
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <ProfileCard profile={profile} onEditProfile={updateProfile} />
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-colors text-[#A1A1A6] hover:bg-[#121214] hover:text-white"
          style={{ fontSize: 15 }}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

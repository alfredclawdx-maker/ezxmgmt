import { G } from '../lib/core.js';
import { Sidebar } from './Sidebar.jsx';

export function DashboardLayout({ activeTab, onNavigate, onLogout, profile, updateProfile, metrics, children }) {
  return (
    <div className="min-h-screen flex ezx-fade-in" style={{ background: '#050403', color: G.text }}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={onNavigate}
        onLogout={onLogout}
        profile={profile}
        updateProfile={updateProfile}
        metrics={metrics}
      />
      <main className="flex-1 min-w-0 p-4 sm:p-6" style={{ background: 'radial-gradient(1200px 500px at 60% -10%, rgba(212,175,55,0.05), transparent)' }}>
        {children}
      </main>
    </div>
  );
}

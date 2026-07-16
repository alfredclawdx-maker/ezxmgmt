import { Sidebar } from './Sidebar.jsx';

export function DashboardLayout({ activeTab, onNavigate, onLogout, profile, updateProfile, children }) {
  return (
    <div className="h-screen flex gap-4 p-4 ezx-fade-in" style={{ background: '#000000' }}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={onNavigate}
        onLogout={onLogout}
        profile={profile}
        updateProfile={updateProfile}
      />
      <main className="flex-1 min-w-0 overflow-y-auto ezx-scroll">
        {children}
      </main>
    </div>
  );
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LoadingScreen } from './components/LoadingScreen.jsx';
import { PasscodeGate } from './components/PasscodeGate.jsx';
import { ProfileSetup } from './components/ProfileSetup.jsx';
import { DashboardLayout } from './components/DashboardLayout.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { PipelinePage } from './components/pages/PipelinePage.jsx';
import { LoginTrackerPage } from './components/pages/LoginTrackerPage.jsx';
import { AnalyticsPage } from './components/pages/AnalyticsPage.jsx';
import { CalendarPage } from './components/pages/CalendarPage.jsx';
import { ToDoPage } from './components/pages/ToDoPage.jsx';
import { AdSpendPage } from './components/pages/AdSpendPage.jsx';
import { RemindersPage } from './components/pages/RemindersPage.jsx';
import { SettingsPage } from './components/pages/SettingsPage.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useProfile } from './hooks/useProfile.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { loadLeads, saveLeads } from './lib/data.js';

export default function App() {
  const { isAuthenticated, isLoading: authLoading, authenticate, logout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [appState, setAppState] = useState('loading');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const company = { id: 'co_tampa', name: 'Tampa Remodels' };

  // Pipeline data
  const [leads, setLeads] = useLocalStorage('ezx_leads_' + company.id, () => loadLeads(company.id));

  // Persist leads on changes
  useEffect(() => {
    saveLeads(company.id, leads);
  }, [leads, company.id]);

  // Initialize app state based on auth status
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        setAppState(profile ? 'dashboard' : 'profile');
      } else {
        setAppState('passcode');
      }
    }
  }, [authLoading, isAuthenticated, profile]);

  const handleLoadingComplete = useCallback(() => setAppState('passcode'), []);

  const handleAuthenticated = useCallback((passcode) => {
    if (authenticate(passcode)) {
      setAppState(profile ? 'dashboard' : 'profile');
    }
  }, [authenticate, profile]);

  const handleProfileCreated = useCallback((name, email, role) => {
    updateProfile(name, email, role);
    setAppState('dashboard');
  }, [updateProfile]);

  const handleLogout = useCallback(() => {
    logout();
    setAppState('passcode');
  }, [logout]);

  // Calculate metrics from leads
  const metrics = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        total: 0,
        qualified: 0,
        conversionRate: 0,
        revenue: 0,
        pipelineValue: 0
      };
    }

    const total = leads.length;
    const notLost = leads.filter(l => !l.lost);
    const qualified = notLost.filter(l => ['QUALIFIED', 'PROPOSAL', 'WON'].includes(l.stage)).length;
    const won = notLost.filter(l => l.stage === 'WON').length;
    const wonValue = won ? notLost.filter(l => l.stage === 'WON').reduce((sum, l) => sum + Number(l.value || 0), 0) : 0;
    const pipelineValue = notLost.reduce((sum, l) => sum + Number(l.value || 0), 0);

    return {
      total,
      qualified,
      conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
      revenue: wonValue,
      pipelineValue
    };
  }, [leads]);

  return (
    <div className="w-full min-h-screen">
      {appState === 'loading' && <LoadingScreen onComplete={handleLoadingComplete} />}
      {appState === 'passcode' && <PasscodeGate onAuthenticated={handleAuthenticated} />}
      {appState === 'profile' && <ProfileSetup onProfileCreated={handleProfileCreated} />}
      {appState === 'dashboard' && (
        <DashboardLayout
          activeTab={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          profile={profile}
          updateProfile={updateProfile}
          metrics={metrics}
        >
          {currentPage === 'dashboard' && <Dashboard profile={profile} metrics={metrics} />}
          {currentPage === 'pipeline' && <PipelinePage leads={leads} setLeads={setLeads} company={company} onLogout={handleLogout} />}
          {currentPage === 'login-tracker' && <LoginTrackerPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'calendar' && <CalendarPage />}
          {currentPage === 'to-do' && <ToDoPage />}
          {currentPage === 'ad-spend' && <AdSpendPage />}
          {currentPage === 'reminders' && <RemindersPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </DashboardLayout>
      )}
    </div>
  );
}

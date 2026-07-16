import { useState, useCallback, useEffect, useRef } from 'react';
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
import { useLoginTracker } from './hooks/useLoginTracker.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { loadLeads, saveLeads } from './lib/data.js';

/**
 * Flow: loading → (auth check) → passcode → profile setup (first time) → dashboard.
 * Auth persists in localStorage — passcode is only asked once until Sign Out.
 * The dashboard sidebar is the single navigation surface for all pages.
 */
export default function App() {
  const { isAuthenticated, authenticate, logout } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { logins, stats, recordLogin } = useLoginTracker();

  const [appState, setAppState] = useState('loading');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const company = { id: 'co_tampa', name: 'Tampa Remodels' };

  const [leads, setLeads] = useLocalStorage('ezx_leads_' + company.id, () => loadLeads(company.id));

  useEffect(() => {
    saveLeads(company.id, leads);
  }, [leads, company.id]);

  // Record today's login while the app is in use. The interval + focus listener
  // catch the day rolling over when the app is left open past midnight.
  useEffect(() => {
    if (appState !== 'dashboard') return;
    recordLogin();
    const id = setInterval(recordLogin, 60_000);
    window.addEventListener('focus', recordLogin);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', recordLogin);
    };
  }, [appState, recordLogin]);

  // Where to go once the loading animation finishes (kept in a ref so the
  // callback stays stable and the animation never restarts)
  const nextAfterLoading = useRef('passcode');
  useEffect(() => {
    nextAfterLoading.current = isAuthenticated ? (profile ? 'dashboard' : 'profile') : 'passcode';
  }, [isAuthenticated, profile]);

  const handleLoadingComplete = useCallback(() => setAppState(nextAfterLoading.current), []);

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
    setCurrentPage('dashboard');
    setAppState('passcode');
  }, [logout]);

  return (
    <div className="w-full min-h-screen bg-black">
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
        >
          {currentPage === 'dashboard' && <Dashboard logins={logins} stats={stats} />}
          {currentPage === 'pipeline' && <PipelinePage leads={leads} setLeads={setLeads} company={company} />}
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

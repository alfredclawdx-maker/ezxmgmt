import { useState, useEffect } from 'react';

/**
 * Auth is intentionally NOT persisted: the passcode must be entered manually
 * on every app open (like a computer login screen). Once entered, navigating
 * anywhere inside the app never re-asks until the page is closed/reloaded
 * or the user signs out.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clean up the legacy persisted token so old sessions don't linger
  useEffect(() => {
    try { localStorage.removeItem('authToken'); } catch { /* storage blocked */ }
  }, []);

  const authenticate = (passcode) => {
    if (passcode === '0001001') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return { isAuthenticated, authenticate, logout };
}

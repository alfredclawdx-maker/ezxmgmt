import { useState, useCallback, useMemo } from 'react';

const KEY = 'ezx_logins';
const DAY_MS = 24 * 60 * 60 * 1000;

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function readLogins() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useLoginTracker() {
  const [logins, setLogins] = useState(readLogins);

  const recordLogin = useCallback(() => {
    const today = toKey(new Date());
    setLogins((prev) => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today].sort();
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const set = new Set(logins);
    const now = new Date();

    // Current streak: consecutive days ending today (or yesterday if today not yet logged)
    let cursor = new Date(now);
    if (!set.has(toKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
    let currentStreak = 0;
    while (set.has(toKey(cursor))) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    // Longest streak: longest run of consecutive dates
    let longestStreak = 0;
    let run = 0;
    let prevTime = null;
    [...logins].sort().forEach((key) => {
      const [y, m, d] = key.split('-').map(Number);
      const t = new Date(y, m - 1, d).getTime();
      run = prevTime !== null && t - prevTime === DAY_MS ? run + 1 : 1;
      prevTime = t;
      if (run > longestStreak) longestStreak = run;
    });

    const monthPrefix = toKey(now).slice(0, 7);
    const monthlyLogins = logins.filter((k) => k.startsWith(monthPrefix)).length;

    return { currentStreak, longestStreak, monthlyLogins };
  }, [logins]);

  return { logins, stats, recordLogin };
}

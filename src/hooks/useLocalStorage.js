import { useState, useEffect, useRef } from "react";

/** Persist state to localStorage (debounced 500ms). Pipeline data only — never auth. */
export function useLocalStorage(key, initializer) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch { /* fall through to fresh data */ }
    return typeof initializer === "function" ? initializer() : initializer;
  });
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked */ }
    }, 500);
    return () => clearTimeout(timer.current);
  }, [key, value]);
  return [value, setValue];
}

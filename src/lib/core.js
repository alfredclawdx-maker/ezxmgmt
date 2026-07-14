/* ==SECTION:THEME== */
export const G = {
  bg: "#070605",
  panel: "#0F0D08",
  panel2: "#14110A",
  border: "rgba(212,175,55,0.22)",
  borderSoft: "rgba(212,175,55,0.12)",
  gold: "#D4AF37",
  goldBright: "#F0C64A",
  text: "#EDE8DA",
  dim: "#9A937F",
  faint: "#6B6555",
};
export const STAGE_META = [
  { id: "NEW", num: "01", label: "New leads", color: "#D4AF37" },
  { id: "CONTACTED", num: "02", label: "Contacted", color: "#4A90E8" },
  { id: "QUALIFIED", num: "03", label: "Qualified", color: "#3DBE7B" },
  { id: "PROPOSAL", num: "04", label: "Proposal sent", color: "#A96FE8" },
  { id: "WON", num: "05", label: "Closed won", color: "#E8963C" },
];
export const STAGE_IDS = STAGE_META.map((s) => s.id);
export const HOUR = 3600000, DAY = 24 * HOUR;

/* ==SECTION:STORAGE== */
/* localStorage when available (Vite/Vercel); silent in-memory fallback (artifact). */
const memStore = new Map();
export const store = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch { /* blocked → memory */ }
    if (memStore.has(key)) return memStore.get(key);
    return typeof fallback === "function" ? fallback() : fallback;
  },
  set(key, value) {
    memStore.set(key, value);
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* memory only */ }
  },
  remove(key) {
    memStore.delete(key);
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
  },
};

/* ==SECTION:UTIL== */
export const estNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
export const money = (n) => "$" + Number(n || 0).toLocaleString();
export const moneyK = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : "$" + n);
export function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60000))}m ago`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h ago`;
  return `${Math.round(ms / DAY)}d ago`;
}
export const uid = () => Math.random().toString(36).slice(2, 9);

import { G } from "../../lib/core.js";

export function NavItem({ icon: Icon, label, active: isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left relative"
      style={{
        color: isActive ? G.goldBright : onClick ? G.dim : "#57523F",
        background: isActive ? "linear-gradient(90deg, rgba(212,175,55,0.14), rgba(212,175,55,0.03))" : "transparent",
        border: isActive ? `1px solid ${G.border}` : "1px solid transparent",
        boxShadow: isActive ? "0 0 16px rgba(212,175,55,0.15)" : "none",
        cursor: onClick ? "pointer" : "default",
        fontSize: 11.5,
        letterSpacing: "0.22em",
      }}
    >
      <Icon className="w-4 h-4 shrink-0" /> {label}
      {badge && (
        <span
          className="ml-auto w-5 h-5 rounded-full flex items-center justify-center font-mono"
          style={{ background: G.gold, color: "#141105", fontSize: 10, fontWeight: 700 }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-colors ${
        active
          ? 'bg-[#1C1C1E] text-white'
          : 'text-[#A1A1A6] hover:bg-[#121214] hover:text-white'
      }`}
      style={{ fontSize: 15 }}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
      {label}
    </button>
  );
}

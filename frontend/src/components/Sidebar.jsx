import { NavLink } from "react-router-dom";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/employees",
    label: "Employees",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside style={{ backgroundColor: "#0a1628", borderRight: "1px solid #1e3a6e" }} className="w-56 shrink-0 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div style={{ borderBottom: "1px solid #1e3a6e" }} className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">HRMS Lite</p>
            <p className="text-xs text-slate-500 leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }
                : { border: "1px solid transparent", color: "#94a3b8" }
            }
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:text-slate-200"
            onMouseEnter={(e) => { if (!e.currentTarget.style.backgroundColor.includes("59,130")) e.currentTarget.style.backgroundColor = "#0f2040"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.style.backgroundColor.includes("59,130")) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e3a6e" }} className="px-5 py-4">
        <p className="text-xs text-slate-600 font-mono">v1.0.0</p>
      </div>
    </aside>
  );
}
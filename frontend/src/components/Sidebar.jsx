import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CalendarCheck, Activity } from "lucide-react";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    to: "/employees",
    label: "Employees",
    icon: <Users className="w-4 h-4" />,
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: <CalendarCheck className="w-4 h-4" />,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 bg-card border-r border-border shadow-sm">
      {/* Logo */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-bold text-card-foreground leading-tight tracking-tight">HRMS Lite</p>
            <p className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-xs text-muted-foreground font-mono">v1.0.0</p>
      </div>
    </aside>
  );
}
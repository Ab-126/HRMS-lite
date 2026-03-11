import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employees";
import { getAttendance } from "../api/attendance";
import Spinner from "../components/Spinner";

function StatCard({ label, value, sub, iconBg, iconColor, icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEmployees(), getAttendance()])
      .then(([emp, att]) => { setEmployees(emp.employees || []); setAttendance(att); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendance?.records?.filter((r) => r.date === today) || [];
  const presentToday = todayRecords.filter((r) => r.status === "Present").length;
  const absentToday = todayRecords.filter((r) => r.status === "Absent").length;
  const depts = [...new Set(employees.map((e) => e.department))].length;

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={employees.length} sub={`${depts} department${depts !== 1 ? "s" : ""}`}
          iconBg="rgba(59,130,246,0.15)" iconColor="#60a5fa"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="Present Today" value={presentToday} sub={`of ${employees.length} marked`}
          iconBg="rgba(16,185,129,0.15)" iconColor="#34d399"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>}
        />
        <StatCard label="Absent Today" value={absentToday} sub="marked absent"
          iconBg="rgba(239,68,68,0.15)" iconColor="#f87171"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        />
        <StatCard label="Total Records" value={attendance?.total || 0} sub="all time"
          iconBg="rgba(168,85,247,0.15)" iconColor="#c084fc"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1e3a6e" }}>
            <h2 className="text-sm font-semibold text-white">Recent Employees</h2>
            <Link to="/employees" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          <div>
            {employees.slice(0, 5).map((emp) => (
              <div key={emp.employee_id} className="flex items-center gap-3 px-5 py-3 transition-colors" style={{borderBottom:"1px solid rgba(30,58,110,0.4)"}}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="#0f2040"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ backgroundColor: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>
                  {emp.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{emp.full_name}</p>
                  <p className="text-xs text-slate-500">{emp.department}</p>
                </div>
                <span className="ml-auto text-xs font-mono text-slate-600 shrink-0">{emp.employee_id}</span>
              </div>
            ))}
            {employees.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No employees yet.</p>}
          </div>
        </div>

        {/* Departments */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1e3a6e" }}>
            <h2 className="text-sm font-semibold text-white">Departments</h2>
            <span className="text-xs text-slate-500">{depts} total</span>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(employees.reduce((acc, e) => { acc[e.department] = (acc[e.department] || 0) + 1; return acc; }, {}))
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => (
                <div key={dept}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-300">{dept}</span>
                    <span className="text-xs font-mono text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#0f2040" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / employees.length) * 100}%`, backgroundColor: "#3b82f6" }} />
                  </div>
                </div>
              ))}
            {employees.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
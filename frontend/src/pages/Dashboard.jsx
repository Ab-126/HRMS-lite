import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employees";
import { getAttendance } from "../api/attendance";
import Spinner from "../components/Spinner";
import { Users, UserCheck, UserMinus, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function StatCard({ label, value, sub, iconBg, iconColor, icon: Icon }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
              {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: iconBg, color: iconColor }}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex-1 p-8 space-y-8 animate-fade-in bg-slate-50/50 min-h-screen">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Employees" value={employees.length} sub={`${depts} depts`}
          iconBg="rgb(239 246 255)" iconColor="rgb(59 130 246)" icon={Users}
        />
        <StatCard label="Present Today" value={presentToday} sub={`of ${employees.length}`}
          iconBg="rgb(209 250 229)" iconColor="rgb(16 185 129)" icon={UserCheck}
        />
        <StatCard label="Absent Today" value={absentToday} sub="marked"
          iconBg="rgb(254 226 226)" iconColor="rgb(239 68 68)" icon={UserMinus}
        />
        <StatCard label="Total Records" value={attendance?.total || 0} sub="all time"
          iconBg="rgb(243 232 255)" iconColor="rgb(168 85 247)" icon={CalendarDays}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Recent Employees */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div className="space-y-1">
              <CardTitle className="text-base">Recent Employees</CardTitle>
              <CardDescription>Latest additions to your team.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/employees">
                View all <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.employee_id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{emp.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{emp.department}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-2 py-1 rounded-md">{emp.employee_id}</span>
                  </div>
                </div>
              ))}
              {employees.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No employees yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div className="space-y-1">
              <CardTitle className="text-base">Departments</CardTitle>
              <CardDescription>Employee distribution.</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{depts} total</div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {Object.entries(employees.reduce((acc, e) => { acc[e.department] = (acc[e.department] || 0) + 1; return acc; }, {}))
                .sort((a, b) => b[1] - a[1])
                .map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{dept}</span>
                      <span className="text-sm text-muted-foreground">{count} employees</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${(count / employees.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              {employees.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
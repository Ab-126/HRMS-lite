import { useState, useEffect, useCallback } from "react";
import { getEmployees, createEmployee, deleteEmployee } from "../api/employees";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

const DEPTS = ["Engineering","Product","Design","Marketing","Sales","HR","Finance","Operations","Legal"];

function AddEmployeeForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Employee ID *</label>
          <input className="input" placeholder="e.g. EMP001" value={form.employee_id} onChange={set("employee_id")} required />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name *</label>
          <input className="input" placeholder="John Doe" value={form.full_name} onChange={set("full_name")} required />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email Address *</label>
        <input className="input" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} required />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Department *</label>
        <select className="input" value={form.department} onChange={set("department")} required>
          <option value="">Select department</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {error && <div className="rounded-lg px-3 py-2.5 text-sm text-red-400" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <div className="w-3.5 h-3.5 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />}
          Add Employee
        </button>
      </div>
    </form>
  );
}

export default function Employees() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    getEmployees().then((d) => setEmployees(d.employees || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleAdd = async (form) => {
    setAddLoading(true); setAddError("");
    try {
      await createEmployee(form);
      toast("Employee added successfully.", "success");
      setAddOpen(false); fetchEmployees();
    } catch (e) { setAddError(e.message); }
    finally { setAddLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteEmployee(deleteTarget.employee_id);
      toast("Employee deleted.", "success");
      setDeleteTarget(null); fetchEmployees();
    } catch (e) { toast(e.message, "error"); }
    finally { setDeleteLoading(false); }
  };

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">{employees.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => { setAddOpen(true); setAddError(""); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>
      </div>

      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="input pl-9 max-w-sm" placeholder="Search by name, ID, or department…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            title={search ? "No results found" : "No employees yet"}
            description={search ? "Try a different search term." : "Add your first employee to get started."}
            action={!search && <button className="btn-primary" onClick={() => setAddOpen(true)}>Add Employee</button>}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a6e" }}>
                {["Employee","ID","Department","Email","Present Days",""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.employee_id} className="transition-colors group" style={{ borderBottom: "1px solid rgba(30,58,110,0.4)" }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor="#0f2040"}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded" style={{ backgroundColor: "#0f2040" }}>{emp.employee_id}</span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm text-slate-400">{emp.department}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-slate-400">{emp.email}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium text-slate-300">{emp.total_present_days ?? 0} days</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setDeleteTarget(emp)} className="btn-danger opacity-0 group-hover:opacity-100">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Employee">
        <AddEmployeeForm onSubmit={handleAdd} loading={addLoading} error={addError} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading}
        title="Delete Employee" message={`Are you sure you want to delete ${deleteTarget?.full_name}? This will also remove all their attendance records.`} />
    </div>
  );
}
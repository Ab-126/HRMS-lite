import { useState, useEffect, useCallback } from "react";
import { getEmployees, createEmployee, deleteEmployee } from "../api/employees";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Users } from "lucide-react";

const DEPTS = ["Engineering","Product","Design","Marketing","Sales","HR","Finance","Operations","Legal"];

function AddEmployeeForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Employee ID *</label>
          <Input placeholder="e.g. EMP001" value={form.employee_id} onChange={set("employee_id")} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name *</label>
          <Input placeholder="John Doe" value={form.full_name} onChange={set("full_name")} required />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email Address *</label>
        <Input type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Department *</label>
        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.department} onChange={set("department")} required>
          <option value="" disabled>Select department</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {error && <div className="rounded-md bg-destructive/15 text-destructive border border-destructive/20 px-4 py-3 text-sm flex gap-2"><div className="font-semibold">Error:</div>{error}</div>}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Adding..." : "Add Employee"}
        </Button>
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
    <div className="flex-1 p-8 space-y-6 animate-fade-in bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1 text-sm">{employees.length} total team members</p>
        </div>
        <Button onClick={() => { setAddOpen(true); setAddError(""); }} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="pl-9 bg-background shadow-sm" 
          placeholder="Search by name, ID, or department…" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10 text-muted-foreground" />}
            title={search ? "No results found" : "No employees yet"}
            description={search ? "We couldn't find anything matching your search term." : "Add your first employee to start building your team."}
            action={!search && <Button onClick={() => setAddOpen(true)}>Add Employee</Button>}
          />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[300px]">Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Present Days</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.employee_id} className="group hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{emp.full_name}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{emp.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-md">{emp.employee_id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {emp.department}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {emp.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium">{emp.total_present_days ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteTarget(emp)} 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Employee">
        <AddEmployeeForm onSubmit={handleAdd} loading={addLoading} error={addError} />
      </Modal>
      <ConfirmDialog 
        open={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
        loading={deleteLoading}
        title="Delete Employee" 
        message={`Are you sure you want to delete ${deleteTarget?.full_name}? This will also remove all their attendance records.`} 
      />
    </div>
  );
}
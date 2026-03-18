import { useState, useEffect } from 'react'
import { getAttendance, markAttendance, deleteAttendance } from '../api/attendance'
import { getEmployees } from '../api/employees'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarCheck, Filter, Trash2, X, Plus, CalendarDays } from "lucide-react"

const today = () => new Date().toISOString().split('T')[0]

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function MarkAttendanceModal({ onClose, onMarked }) {
  const [employees, setEmployees] = useState([])
  const [loadingEmps, setLoadingEmps] = useState(true)
  const [form, setForm] = useState({ employee_id: '', date: today(), status: 'Present' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    getEmployees()
      .then((d) => setEmployees(d.employees))
      .catch(() => {})
      .finally(() => setLoadingEmps(false))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.employee_id) e.employee_id = 'Select an employee'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const record = await markAttendance(form)
      onMarked(record)
      onClose()
    } catch (e) {
      setApiError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={true} title="Mark Attendance" onClose={onClose}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Employee *</Label>
          {loadingEmps ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Spinner size="sm" /> Loading employees…
            </div>
          ) : employees.length === 0 ? (
            <p className="text-muted-foreground text-sm">No employees found. Add employees first.</p>
          ) : (
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.employee_id}
              onChange={(e) => { setForm((p) => ({ ...p, employee_id: e.target.value })); setErrors((p) => ({ ...p, employee_id: '' })) }}
            >
              <option value="" disabled>Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          )}
          {errors.employee_id && <p className="text-destructive text-xs mt-1">{errors.employee_id}</p>}
        </div>

        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.date}
            max={today()}
            onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setErrors((p) => ({ ...p, date: '' })) }}
          />
          {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status *</Label>
          <div className="flex gap-3">
            {['Present', 'Absent'].map((s) => (
              <Button
                key={s}
                type="button"
                variant={form.status === s ? (s === 'Present' ? 'default' : 'destructive') : 'outline'}
                className={form.status === s && s === 'Present' ? 'bg-emerald-500 hover:bg-emerald-600 text-white flex-1' : 'flex-1'}
                onClick={() => setForm((p) => ({ ...p, status: s }))}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {apiError && <div className="rounded-md bg-destructive/15 text-destructive border border-destructive/20 px-4 py-3 text-sm flex gap-2"><div className="font-semibold">Error:</div>{apiError}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || employees.length === 0}>
            {loading ? "Marking..." : "Mark Attendance"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Attendance() {
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ total: 0, total_present: 0, total_absent: 0 })
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMark, setShowMark] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterEmpId, setFilterEmpId] = useState('')

  const load = async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const [attData, empData] = await Promise.all([getAttendance(params), getEmployees()])
      setRecords(attData.records)
      setSummary({ total: attData.total, total_present: attData.total_present, total_absent: attData.total_absent })
      setEmployees(empData.employees)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const applyFilters = () => {
    const params = {}
    if (filterDate) params.date = filterDate
    if (filterEmpId) params.employee_id = filterEmpId
    load(params)
  }

  const clearFilters = () => {
    setFilterDate('')
    setFilterEmpId('')
    load()
  }

  const hasFilters = filterDate || filterEmpId

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteAttendance(deleteTarget.id)
      toast('Attendance record deleted.', 'success')
      setRecords((p) => p.filter((r) => r.id !== deleteTarget.id))
      setSummary((p) => ({
        ...p,
        total: p.total - 1,
        total_present: deleteTarget.status === 'Present' ? p.total_present - 1 : p.total_present,
        total_absent: deleteTarget.status === 'Absent' ? p.total_absent - 1 : p.total_absent,
      }))
      setDeleteTarget(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex-1 p-8 space-y-6 animate-fade-in bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track and manage daily employee attendance</p>
        </div>
        <Button onClick={() => setShowMark(true)} className="w-full sm:w-auto">
          <CalendarCheck className="mr-2 h-4 w-4" /> Mark Attendance
        </Button>
      </div>

      {error && <div className="rounded-md bg-destructive/15 text-destructive border border-destructive/20 px-4 py-3 text-sm flex justify-between items-center"><div className="flex gap-2"><div className="font-semibold">Error:</div>{error}</div><Button variant="outline" size="sm" onClick={() => load()}>Retry</Button></div>}

      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="px-4 py-1.5 text-sm bg-background">
          Total Records: <span className="font-bold ml-1">{summary.total}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-1.5 text-sm bg-emerald-50 text-emerald-700 border-emerald-200">
          Present: <span className="font-bold ml-1">{summary.total_present}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-1.5 text-sm bg-rose-50 text-rose-700 border-rose-200">
          Absent: <span className="font-bold ml-1">{summary.total_absent}</span>
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-end gap-4">
          <div className="flex items-center gap-2 text-muted-foreground pb-2 sm:pb-0">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex-1 w-full sm:w-auto space-y-1.5">
            <Label className="text-xs">By Date</Label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div className="flex-1 w-full sm:w-auto space-y-1.5">
            <Label className="text-xs">By Employee</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}>
              <option value="">All employees</option>
              {employees.map((e) => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={applyFilters} className="flex-1 sm:flex-none">Apply</Button>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="px-3">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table / Empty */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full py-24"><Spinner size="lg" /></div>
        ) : records.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={<CalendarDays className="w-10 h-10 text-muted-foreground" />}
              title="No attendance records"
              description={hasFilters ? 'No records match your filters.' : 'Start marking attendance for your team.'}
              action={!hasFilters && (
                <Button onClick={() => setShowMark(true)}>
                  <Plus className="mr-2 w-4 h-4" /> Mark Attendance
                </Button>
              )}
            />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[300px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => (
                <TableRow key={rec.id} className="group hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                        {(rec.employee_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{rec.employee_name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{rec.employee_id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500">
                      {employees.find((e) => e.employee_id === rec.employee_id)?.department || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600 font-medium">{fmtDate(rec.date)}</span>
                  </TableCell>
                  <TableCell>
                    {rec.status === 'Present' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 pointer-events-none">Present</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 pointer-events-none">Absent</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteTarget(rec)} 
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

      {showMark && (
        <MarkAttendanceModal
          onClose={() => setShowMark(false)}
          onMarked={(rec) => {
            setRecords((p) => [rec, ...p])
            setSummary((p) => ({
              ...p,
              total: p.total + 1,
              total_present: rec.status === 'Present' ? p.total_present + 1 : p.total_present,
              total_absent:  rec.status === 'Absent'  ? p.total_absent  + 1 : p.total_absent,
            }))
            toast(`Attendance marked as ${rec.status}!`, 'success')
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Attendance Record"
          message={`Delete attendance for "${deleteTarget.employee_name}" on ${fmtDate(deleteTarget.date)}?`}
        />
      )}
    </div>
  )
}
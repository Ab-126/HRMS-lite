import { useState, useEffect } from 'react'
import { getAttendance, markAttendance, deleteAttendance } from '../api/attendance'
import { getEmployees } from '../api/employees'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import PageHeader from '../components/PageHeader'
import ErrorBanner from '../components/ErrorBanner'
import Empty from '../components/Empty'

const today = () => new Date().toISOString().split('T')[0]

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/* ── Mark Attendance Modal ─────────────────────────────────────────────── */
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
      <div className="space-y-4">
        {/* Employee */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Employee *</label>
          {loadingEmps ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
              <Spinner size="sm" /> Loading employees…
            </div>
          ) : employees.length === 0 ? (
            <p className="text-slate-400 text-sm">No employees found. Add employees first.</p>
          ) : (
            <select
              className="input"
              value={form.employee_id}
              onChange={(e) => { setForm((p) => ({ ...p, employee_id: e.target.value })); setErrors((p) => ({ ...p, employee_id: '' })) }}
            >
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          )}
          {errors.employee_id && <p className="text-red-400 text-xs mt-1">{errors.employee_id}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date *</label>
          <input
            type="date"
            className="input"
            value={form.date}
            max={today()}
            onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setErrors((p) => ({ ...p, date: '' })) }}
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Status toggle */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Status *</label>
          <div className="flex gap-3">
            {['Present', 'Absent'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((p) => ({ ...p, status: s }))}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200"
                style={
                  form.status === s
                    ? s === 'Present'
                      ? { backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                      : { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                    : { backgroundColor: '#0f2040', border: '1px solid #1e3a6e', color: '#64748b' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {apiError && <ErrorBanner message={apiError} />}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading || employees.length === 0}>
            {loading
              ? <div className="w-3.5 h-3.5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            }
            Mark Attendance
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
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
    <div className="flex-1 p-8 animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle="Track and manage daily employee attendance"
        action={
          <button className="btn-primary" onClick={() => setShowMark(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Mark Attendance
          </button>
        }
      />

      {error && <div className="mb-6"><ErrorBanner message={error} onRetry={() => load()} /></div>}

      {/* Summary pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: 'Total Records', val: summary.total, style: { border: '1px solid #1e3a6e', color: '#cbd5e1' } },
          { label: 'Present', val: summary.total_present, style: { border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', backgroundColor: 'rgba(16,185,129,0.05)' } },
          { label: 'Absent',  val: summary.total_absent,  style: { border: '1px solid rgba(239,68,68,0.3)',  color: '#f87171', backgroundColor: 'rgba(239,68,68,0.05)'  } },
        ].map(({ label, val, style }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={style}>
            <span>{val}</span>
            <span className="font-normal opacity-70">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span className="text-xs font-semibold uppercase tracking-widest">Filter</span>
        </div>
        <div className="flex-1 min-w-40">
          <label className="text-xs font-medium text-slate-400 mb-1 block">By Date</label>
          <input type="date" className="input text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-xs font-medium text-slate-400 mb-1 block">By Employee</label>
          <select className="input text-sm" value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}>
            <option value="">All employees</option>
            {employees.map((e) => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
          </select>
        </div>
        <button className="btn-primary py-2.5" onClick={applyFilters}>Apply</button>
        {hasFilters && (
          <button className="btn-ghost py-2.5" onClick={clearFilters}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear
          </button>
        )}
      </div>

      {/* Table / Empty */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Empty
          icon={() => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>}
          title="No attendance records"
          description={hasFilters ? 'No records match your filters.' : 'Start marking attendance for your team.'}
          action={!hasFilters && (
            <button className="btn-primary" onClick={() => setShowMark(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Mark Attendance
            </button>
          )}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e3a6e' }}>
                {['Employee', 'Department', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="transition-colors group" style={{ borderBottom: '1px solid rgba(30,58,110,0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f2040'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                        {(rec.employee_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{rec.employee_name}</p>
                        <p className="text-xs font-mono text-slate-500">{rec.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-400">
                      {employees.find((e) => e.employee_id === rec.employee_id)?.department || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-300">{fmtDate(rec.date)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {rec.status === 'Present' ? (
                      <span className="badge-present"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Present</span>
                    ) : (
                      <span className="badge-absent"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Absent</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="btn-danger opacity-0 group-hover:opacity-100 py-1.5 px-2.5 text-xs" onClick={() => setDeleteTarget(rec)}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
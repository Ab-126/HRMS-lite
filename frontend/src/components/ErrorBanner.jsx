export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-red-400"
      style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {message}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-medium text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors shrink-0 ml-4">
          Retry
        </button>
      )}
    </div>
  )
}
import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {message}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold hover:opacity-80 underline underline-offset-2 transition-opacity shrink-0 ml-4">
          Retry
        </button>
      )}
    </div>
  )
}
import { useEffect } from "react";

export default function Toast({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  const styles = {
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    error: "bg-red-500/15 border-red-500/30 text-red-300",
    info: "bg-accent/15 border-accent/30 text-accent-light",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "i",
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm animate-slide-up text-sm max-w-sm ${styles[toast.type]}`}
    >
      <span className="font-bold shrink-0 w-4 text-center">{icons[toast.type]}</span>
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
}
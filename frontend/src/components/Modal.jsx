import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  console.log("Modal active")
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="relative card w-full max-w-md animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1e3a6e" }}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg" style={{}} onMouseEnter={e => e.currentTarget.style.backgroundColor="#0f2040"} onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
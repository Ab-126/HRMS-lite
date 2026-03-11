export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-slate-500" style={{ backgroundColor: "#0f2040", border: "1px solid #1e3a6e" }}>
        {icon}
      </div>
      <p className="text-base font-semibold text-slate-300 mb-1">{title}</p>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-muted-foreground bg-primary/5 border border-primary/10">
        {icon}
      </div>
      <p className="text-base font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
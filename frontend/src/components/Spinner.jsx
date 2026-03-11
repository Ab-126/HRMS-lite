export default function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size];
  return (
    <div className={`${s} rounded-full animate-spin`} style={{ border: "2px solid #1e3a6e", borderTopColor: "#3b82f6" }} />
  );
}
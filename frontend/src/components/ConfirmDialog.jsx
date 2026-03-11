import Modal from "./Modal";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 flex items-center gap-2"
          style={{ backgroundColor: "rgba(239,68,68,0.85)" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(239,68,68,1)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor="rgba(239,68,68,0.85)"}
        >
          {loading && <div className="w-3.5 h-3.5 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />}
          Delete
        </button>
      </div>
    </Modal>
  );
}
import { Power, X } from "lucide-react";

export default function FacilityStatusModal({
  facility,
  targetStatus,
  setTargetStatus,
  statusReason,
  setStatusReason,
  updatingStatus,
  onSubmit,
  onClose,
  statuses,
}) {
  if (!facility) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Power size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#14121b]">Update Operational Status</h3>
              <p className="text-xs text-[#767679]">
                {facility.name} ({facility.code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Target Status <span className="text-red-500">*</span>
            </span>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="reference-select w-full"
            >
              {statuses.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Reason (Optional)
            </span>
            <textarea
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="reference-input w-full !h-auto py-2"
              placeholder="Enter justification (e.g. Scheduled facility maintenance, renovation completed, branch closed)..."
            />
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="reference-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="reference-button-primary"
            >
              {updatingStatus ? "Updating..." : "Confirm Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import managerTicketService from "../api/managerTicketService";
import managerUserService from "../api/managerUserService";

export default function AssignStaffModal({ ticket, facilityId, isOpen, onClose, onSuccess }) {
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !facilityId) return;
    let active = true;
    setLoadingStaff(true);
    setError("");

    managerUserService
      .getStaffs(facilityId)
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setStaffList(list);
        if (list.length > 0) {
          // Preselect first active staff or first staff
          const firstActive = list.find((s) => s.isActive ?? true);
          setSelectedStaffId(String(firstActive ? firstActive.id : list[0].id));
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách nhân viên.");
      })
      .finally(() => {
        if (active) setLoadingStaff(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, facilityId]);

  if (!isOpen || !ticket) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedStaffId) {
      setError("Vui lòng chọn nhân viên xử lý.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await managerTicketService.assignStaff(ticket.id, {
        staffId: Number(selectedStaffId),
        notes: notes.trim(),
      });

      const staffObj = staffList.find((s) => String(s.id) === String(selectedStaffId));
      if (onSuccess) {
        onSuccess(result || {
          assignedEmployeeId: Number(selectedStaffId),
          assignedEmployeeName: staffObj?.fullName || staffObj?.name || `Staff #${selectedStaffId}`,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Không thể phân công nhân viên.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-staff-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#1d5fe5]">
                assignment_ind
              </span>
              <h2 id="assign-staff-title" className="text-base font-bold text-slate-900">
                Giao việc cho Staff xử lý Ticket
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Ticket: <strong className="text-slate-700">{ticket.ticketNo || `#${ticket.id}`}</strong>
              {ticket.unitCode && ` · Kho ${ticket.unitCode}`}
              {ticket.subject && ` · ${ticket.subject}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Chọn nhân viên */}
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
              Chọn nhân viên cùng cơ sở *
            </label>
            {loadingStaff ? (
              <p className="text-slate-400 italic">Đang tải danh sách nhân viên...</p>
            ) : staffList.length === 0 ? (
              <p className="text-amber-700 italic">Cơ sở này chưa có nhân viên nào trong hệ thống.</p>
            ) : (
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5]"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName || staff.name || `Staff #${staff.id}`} ({staff.position || "Nhân viên"}) {staff.isActive === false ? "· [Inactive]" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hướng dẫn giao việc */}
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
              Ghi chú chỉ đạo / Hướng dẫn xử lý:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Kiểm tra tình trạng ổ khóa, lau dọn khu vực kho hoặc báo cáo nếu phát hiện hư hại nặng..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-900 text-[11px] leading-relaxed">
            📌 Ticket sau khi giao sẽ chuyển sang trạng thái <strong>Assigned_To_Staff</strong> và xuất hiện trực tiếp trong danh sách việc của nhân viên được chỉ định.
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-rose-50 p-2.5 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedStaffId || staffList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-4 py-1.5 font-bold text-white shadow-xs transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{submitting ? "Đang giao việc..." : "Xác nhận giao việc"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

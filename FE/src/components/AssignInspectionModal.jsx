import { useEffect, useState } from "react";
import { managerUserService } from "../api/managerUserService";
import managerExpiringContractsService from "../api/managerExpiringContractsService";

function getStaffId(s) {
  if (!s) return "";
  return s.employeeId ?? s.userId ?? s.id ?? s.employeeUserId ?? "";
}

function getStaffName(s) {
  if (!s) return "";
  return s.fullName || s.name || s.employeeName || s.employeeCode || `Staff #${getStaffId(s)}`;
}

export default function AssignInspectionModal({
  isOpen,
  onClose,
  onSuccess,
  agreement,
  facilityId,
}) {
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
        const activeStaff = list.filter((s) => s.status === undefined || s.status === "active" || s.isActive !== false);
        setStaffList(activeStaff);
        if (activeStaff.length > 0) {
          const firstId = getStaffId(activeStaff[0]);
          setSelectedStaffId(String(firstId));
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách nhân viên tại cơ sở.");
      })
      .finally(() => {
        if (active) setLoadingStaff(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, facilityId]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen || !agreement) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const numericStaffId = Number(selectedStaffId);
    if (!selectedStaffId || isNaN(numericStaffId) || numericStaffId <= 0) {
      setError("Vui lòng chọn một nhân viên để phân công nghiệm thu kho.");
      return;
    }

    setSubmitting(true);
    setError("");

    const chosenStaff = staffList.find(
      (s) => String(getStaffId(s)) === String(selectedStaffId)
    );
    const staffName = getStaffName(chosenStaff);

    try {
      await managerExpiringContractsService.assignInspection(agreement.id, {
        employeeId: numericStaffId,
        staffId: numericStaffId,
        staffName,
        notes: notes.trim(),
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message || "Không thể phân công kiểm tra kho. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-inspection-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#1d5fe5]">
                fact_check
              </span>
              <h2 id="assign-inspection-title" className="text-base font-extrabold text-slate-900">
                Phân công kiểm tra kho
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Chỉ định nhân viên cùng cơ sở thực hiện kiểm tra hiện trạng trả kho.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Agreement summary */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-1.5 text-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hợp đồng:</span>
              <span className="font-mono font-bold text-slate-900">{agreement.agreementNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ô kho:</span>
              <span className="font-mono font-bold text-[#1d5fe5]">Kho {agreement.unitCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-semibold text-slate-900">{agreement.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngày hết hạn / Trả kho:</span>
              <span className="font-semibold text-amber-700">
                {agreement.requestedMoveOutDate || agreement.endDate}
              </span>
            </div>
          </div>

          {/* Chọn Staff */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
              Chọn nhân viên nghiệm thu kho *
            </label>
            {loadingStaff ? (
              <p className="text-slate-400 italic">Đang tải danh sách nhân viên cơ sở...</p>
            ) : staffList.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800">
                Không tìm thấy nhân viên đang hoạt động tại cơ sở này.
              </p>
            ) : (
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5]"
              >
                {staffList.map((staff) => {
                  const sid = getStaffId(staff);
                  return (
                    <option key={sid} value={sid}>
                      {getStaffName(staff)} ({staff.assignmentRole || staff.role || "Staff"}) - {staff.email || staff.phoneNumber || ""}
                    </option>
                  );
                })}
              </select>
            )}
            <span className="text-[10px] text-slate-400 block mt-1">
              * Nhân viên được phân công sẽ nhận thông báo trên bảng việc và ứng dụng Staff.
            </span>
          </div>

          {/* Hướng dẫn kiểm tra */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
              Ghi chú &amp; Chỉ dẫn nghiệm thu:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Kiểm tra kỹ hiện trạng cửa cuốn, vết ẩm trần, dọn rác và quét dọn kho sạch sẽ..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-rose-50 p-2.5 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedStaffId || staffList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-blue-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
              <span>{submitting ? "Đang giao việc..." : "Xác nhận phân công"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

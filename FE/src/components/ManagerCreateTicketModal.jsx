import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import managerTicketService from "../api/managerTicketService";
import staffFacilityService from "../api/staffFacilityService";

const CATEGORIES = [
  { value: "incident", label: "Sự cố thiết bị / Khẩn cấp" },
  { value: "maintenance", label: "Bảo trì / Sửa chữa kho" },
  { value: "cleaning", label: "Dọn dẹp / Vệ sinh ô kho" },
  { value: "access", label: "Kiểm soát truy cập / Ổ khóa" },
];

const PRIORITIES = [
  { value: "normal", label: "Bình thường (Normal)" },
  { value: "high", label: "Ưu tiên cao (High)" },
  { value: "urgent", label: "Khẩn cấp — Cần xử lý ngay (Urgent)" },
];

export default function ManagerCreateTicketModal({
 isOpen, onClose, facilityId, onSuccess }) {
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("incident");
  const [priority, setPriority] = useState("normal");
  const [storageUnitId, setStorageUnitId] = useState("");
  const [assignToStaffId, setAssignToStaffId] = useState("");

  const [units, setUnits] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !facilityId) return;

    let active = true;
    setLoadingOptions(true);

    Promise.allSettled([
      staffFacilityService.getUnits(Number(facilityId)),
      managerTicketService.getFacilityStaffs(Number(facilityId)),
    ]).then(([unitsRes, staffsRes]) => {
      if (!active) return;
      if (unitsRes.status === "fulfilled" && Array.isArray(unitsRes.value)) {
        setUnits(unitsRes.value);
      }
      if (staffsRes.status === "fulfilled" && Array.isArray(staffsRes.value)) {
        setStaffs(staffsRes.value);
      }
      setLoadingOptions(false);
    });

    return () => {
      active = false;
    };
  }, [isOpen, facilityId]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Vui lòng nhập tiêu đề sự cố.");
      return;
    }
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết sự cố.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        facilityId: Number(facilityId),
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        storageUnitId: storageUnitId ? Number(storageUnitId) : null,
        assignToStaffId: assignToStaffId ? Number(assignToStaffId) : null,
      };

      const result = await managerTicketService.createTicket(payload);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err?.message || "Không thể tạo Ticket sự cố. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-zinc-900 dark:text-zinc-100">
              add_task
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("tickets.create_ticket_title", "Tạo mới Ticket sự cố cơ sở")}</h2>
              <p className="text-xs text-slate-500">
                
              </p>
            </div>
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

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề sự cố / Công việc *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Kẹt ray cửa cuốn ô kho A-102, Hỏng đèn chiếu sáng..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Phân loại & {t("table.priority", "Mức độ ưu tiên")} */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("table.category", "Phân loại công việc")}
              </label>
              <SelectDropdown
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </SelectDropdown>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("table.priority", "Mức độ ưu tiên")}
              </label>
              <SelectDropdown
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </SelectDropdown>
            </div>
          </div>

          {/* Ô kho liên quan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ô kho liên quan (tùy chọn)
            </label>
            <SelectDropdown
              value={storageUnitId}
              onChange={(e) => setStorageUnitId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs"
            >
              <option value="">— Sự cố chung cơ sở / Không gắn ô kho —</option>
              {units.map((u) => (
                <option key={u.unitId || u.id} value={u.unitId || u.id}>
                  {u.unitCode} ({u.status || u.physicalStatus})
                </option>
              ))}
            </SelectDropdown>
          </div>

          {/* Giao việc cho Staff */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giao việc ngay cho Nhân viên (tùy chọn)
            </label>
            <SelectDropdown
              value={assignToStaffId}
              onChange={(e) => setAssignToStaffId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs"
            >
              <option value="">— Để vào hàng đợi (Chờ phân công sau) —</option>
              {staffs.map((s) => (
                <option key={s.employeeId || s.id} value={s.employeeId || s.id}>
                  {s.fullName || s.name} (NV Vận hành)
                </option>
              ))}
            </SelectDropdown>
            <span className="mt-1 block text-[11px] text-slate-500">
              * Nếu chọn nhân viên, ticket sẽ tự động chuyển sang <strong>{t("tickets.assigned_staff", "Đã giao Staff")}</strong> và đẩy thông báo xuống bảng việc của nhân viên.
            </span>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết sự cố / Yêu cầu xử lý *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ghi rõ chi tiết tình trạng sự cố, vị trí cụ thể, và hướng dẫn nhân viên..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{submitting ? "Đang lưu..." : "Xác nhận tạo Ticket"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

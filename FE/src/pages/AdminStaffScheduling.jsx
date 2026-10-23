import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import facilityService from "../api/facilityService";
import adminUserService from "../api/adminUserService";

const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";
const buttonClass = "rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const dutyRoles = [["staff", "Nhân viên trực"], ["shift_lead", "Trưởng ca"], ["manager_on_call", "Quản lý trực"]];
const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormat.format(date);
};
const toLocalInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AdminStaffScheduling() {
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [shiftForm, setShiftForm] = useState({ shiftName: "", startsAt: "", endsAt: "" });
  const [creatingShift, setCreatingShift] = useState(false);
  const [assignForm, setAssignForm] = useState({ shiftId: "", employeeId: "", dutyRole: "staff" });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    facilityService.getFacilities().then((list) => {
      setFacilities(list);
      if (list.length > 0) setFacilityId(String(list[0].id));
    }).catch(() => setFacilities([]));
  }, []);

  function reload() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    managerService.getShifts(facilityId).then(
      (data) => { setShifts(data); setLoading(false); },
      (err) => { setError(err.message || "Không thể tải danh sách ca trực."); setLoading(false); },
    );
    adminUserService.getUsers({ FacilityId: facilityId, Role: "facility_staff", PageSize: 100 })
      .then((data) => setEmployees(data.items || []))
      .catch(() => setEmployees([]));
  }

  useEffect(reload, [facilityId]);

  async function submitShift(event) {
    event.preventDefault();
    setCreatingShift(true);
    setNotice("");
    try {
      await managerService.createShift(facilityId, {
        shiftName: shiftForm.shiftName.trim(),
        startsAt: new Date(shiftForm.startsAt).toISOString(),
        endsAt: new Date(shiftForm.endsAt).toISOString(),
      });
      setNotice("Đã tạo ca trực mới.");
      setShiftForm({ shiftName: "", startsAt: "", endsAt: "" });
      reload();
    } catch (err) {
      setError(err.message || "Không thể tạo ca trực.");
    } finally {
      setCreatingShift(false);
    }
  }

  async function submitAssignment(event) {
    event.preventDefault();
    setAssigning(true);
    setNotice("");
    try {
      await managerService.assignShift(facilityId, {
        shiftId: Number(assignForm.shiftId),
        employeeId: Number(assignForm.employeeId),
        dutyRole: assignForm.dutyRole,
      });
      setNotice("Đã phân ca trực cho nhân viên.");
      setAssignForm({ shiftId: "", employeeId: "", dutyRole: "staff" });
      reload();
    } catch (err) {
      setError(err.message || "Không thể phân ca trực.");
    } finally {
      setAssigning(false);
    }
  }

  const now = new Date();
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <span className="material-symbols-outlined text-[#1d5fe5]">calendar_month</span>
            Lịch trực nhân sự
          </h1>
        </div>
        <button type="button" disabled={loading || !facilityId} onClick={reload} className={buttonClass}>Làm mới</button>
      </div>

      {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
      {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
        <p>{error}</p><button type="button" onClick={reload} className="mt-2 font-semibold underline">Thử lại</button>
      </div>}

      <div className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <label className="max-w-sm"><span className="mb-1 block text-sm font-semibold">Kho *</span>
          <select required value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={inputClass}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form onSubmit={submitShift} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
          <h2 className="font-bold">Tạo ca trực mới</h2>
          <div className="mt-3 space-y-3">
            <label><span className="mb-1 block text-sm font-semibold">Tên ca trực *</span>
              <input required value={shiftForm.shiftName} onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value })} placeholder="VD: Ca sáng (07:00 - 15:00)" className={inputClass} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="mb-1 block text-sm font-semibold">Bắt đầu *</span>
                <input required type="datetime-local" value={shiftForm.startsAt} onChange={(e) => setShiftForm({ ...shiftForm, startsAt: e.target.value })} min={toLocalInputValue(now)} max={toLocalInputValue(inOneWeek)} className={inputClass} />
              </label>
              <label><span className="mb-1 block text-sm font-semibold">Kết thúc *</span>
                <input required type="datetime-local" value={shiftForm.endsAt} onChange={(e) => setShiftForm({ ...shiftForm, endsAt: e.target.value })} min={shiftForm.startsAt || toLocalInputValue(now)} max={toLocalInputValue(inOneWeek)} className={inputClass} />
              </label>
            </div>
          </div>
          <button disabled={creatingShift || !facilityId} className={`mt-4 ${buttonClass}`}>{creatingShift ? "Đang tạo..." : "Tạo ca trực"}</button>
        </form>

        <form onSubmit={submitAssignment} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
          <h2 className="font-bold">Phân ca trực cho nhân viên</h2>
          <div className="mt-3 space-y-3">
            <label><span className="mb-1 block text-sm font-semibold">Ca trực *</span>
              <select required value={assignForm.shiftId} onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })} className={inputClass}>
                <option value="">Chọn ca trực</option>
                {(shifts || []).map((s) => <option key={s.id} value={s.id}>{s.shiftName} · {formatDateTime(s.startsAt)}</option>)}
              </select>
            </label>
            <label><span className="mb-1 block text-sm font-semibold">Nhân viên *</span>
              <select required value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })} className={inputClass}>
                <option value="">Chọn nhân viên</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName || emp.email}</option>)}
              </select>
            </label>
            <label><span className="mb-1 block text-sm font-semibold">Vai trò ca trực *</span>
              <select required value={assignForm.dutyRole} onChange={(e) => setAssignForm({ ...assignForm, dutyRole: e.target.value })} className={inputClass}>
                {dutyRoles.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
              </select>
            </label>
          </div>
          <button disabled={assigning || !facilityId} className={`mt-4 ${buttonClass}`}>{assigning ? "Đang phân ca..." : "Phân ca trực"}</button>
        </form>
      </div>

      <section aria-busy={loading} className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <h2 className="font-bold">Danh sách ca trực{shifts ? ` (${shifts.length})` : ""}</h2>
        {loading && <p role="status" className="py-8 text-center text-sm text-[#58657a]">Đang tải danh sách...</p>}
        {shifts && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase text-[#58657a]">
                {["Tên ca trực", "Bắt đầu", "Kết thúc", "Trạng thái", "Số người được phân ca"].map((label) => <th key={label} className="p-3">{label}</th>)}
              </tr></thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-[#eef1f8] hover:bg-[#f8faff]">
                    <td className="p-3 font-semibold">{shift.shiftName}</td>
                    <td className="p-3">{formatDateTime(shift.startsAt)}</td>
                    <td className="p-3">{formatDateTime(shift.endsAt)}</td>
                    <td className="p-3">{shift.status}</td>
                    <td className="p-3">{shift.assignmentCount}</td>
                  </tr>
                ))}
                {shifts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#58657a]">Chưa có ca trực nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

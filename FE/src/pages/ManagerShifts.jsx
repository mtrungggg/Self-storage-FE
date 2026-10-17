import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

const emptyShiftForm = { shiftName: "", startsAt: "", endsAt: "" };
const emptyAssignmentForm = { shiftId: "", employeeId: "", dutyRole: "front_desk" };

function ManagerShifts() {
  const { facilityId } = useManagerFacility();

  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [shiftForm, setShiftForm] = useState(emptyShiftForm);
  const [savingShift, setSavingShift] = useState(false);

  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterRange, setRosterRange] = useState({ fromDate: "", toDate: "" });

  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadShifts() {
    if (!facilityId) return;
    setLoadingShifts(true);
    setError("");
    try {
      setShifts(await managerService.getShifts(facilityId));
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách ca làm việc.");
    } finally {
      setLoadingShifts(false);
    }
  }

  async function loadRoster() {
    if (!facilityId) return;
    setLoadingRoster(true);
    setError("");
    try {
      setRoster(
        await managerService.getShiftRoster(facilityId, {
          fromDate: rosterRange.fromDate || undefined,
          toDate: rosterRange.toDate || undefined,
        })
      );
    } catch (err) {
      setError(err?.message || "Không thể tải lịch trực.");
    } finally {
      setLoadingRoster(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadShifts(); }, [facilityId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRoster(); }, [facilityId]);

  async function submitShift(event) {
    event.preventDefault();
    setSavingShift(true);
    setError("");
    try {
      await managerService.createShift(facilityId, {
        shiftName: shiftForm.shiftName,
        startsAt: new Date(shiftForm.startsAt).toISOString(),
        endsAt: new Date(shiftForm.endsAt).toISOString(),
      });
      setNotice("Đã tạo ca làm việc mới.");
      setShiftForm(emptyShiftForm);
      await loadShifts();
    } catch (err) {
      setError(err?.message || "Không thể tạo ca làm việc.");
    } finally {
      setSavingShift(false);
    }
  }

  async function submitAssignment(event) {
    event.preventDefault();
    setSavingAssignment(true);
    setError("");
    try {
      await managerService.createShiftAssignment(facilityId, {
        shiftId: Number(assignmentForm.shiftId),
        employeeId: Number(assignmentForm.employeeId),
        dutyRole: assignmentForm.dutyRole,
      });
      setNotice("Đã phân công nhân viên vào ca.");
      setAssignmentForm(emptyAssignmentForm);
      await loadRoster();
    } catch (err) {
      setError(err?.message || "Không thể phân công nhân viên.");
    } finally {
      setSavingAssignment(false);
    }
  }

  return (
    <>
      <h1 className="text-[20px] font-bold">Ca làm việc &amp; Lịch trực</h1>
      <p className="mt-1 text-[11px] text-[#8996a9]">Tạo ca làm việc, phân công nhân viên và theo dõi lịch trực của kho.</p>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="text-[13px] font-bold">Danh sách ca làm việc</div>
          <form onSubmit={submitShift} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input required placeholder="Tên ca (VD: Ca sáng)" value={shiftForm.shiftName} onChange={(e) => setShiftForm((p) => ({ ...p, shiftName: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px] sm:col-span-1" />
            <input required type="datetime-local" value={shiftForm.startsAt} onChange={(e) => setShiftForm((p) => ({ ...p, startsAt: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
            <input required type="datetime-local" value={shiftForm.endsAt} onChange={(e) => setShiftForm((p) => ({ ...p, endsAt: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
            <button type="submit" disabled={savingShift} className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60 sm:col-span-3">
              {savingShift ? "Đang tạo..." : "Tạo ca làm việc"}
            </button>
          </form>

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {loadingShifts ? (
              <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
            ) : shifts.length === 0 ? (
              <p className="text-[11px] text-[#8996a9]">Chưa có ca làm việc nào.</p>
            ) : (
              shifts.map((shift) => (
                <div key={shift.id} className="rounded-[10px] border border-[#eef1f8] p-2.5 text-[11px]">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{shift.shiftName}</span>
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">{shift.assignmentCount} nhân viên</span>
                  </div>
                  <div className="text-[9px] text-[#8996a9]">{formatDateTime(shift.startsAt)} → {formatDateTime(shift.endsAt)} • Mã ca: {shift.id}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="text-[13px] font-bold">Phân công nhân viên vào ca</div>
          <form onSubmit={submitAssignment} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select required value={assignmentForm.shiftId} onChange={(e) => setAssignmentForm((p) => ({ ...p, shiftId: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
              <option value="" disabled>Chọn ca</option>
              {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.shiftName} (#{shift.id})</option>)}
            </select>
            <input required type="number" min="1" placeholder="Mã nhân viên" value={assignmentForm.employeeId} onChange={(e) => setAssignmentForm((p) => ({ ...p, employeeId: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
            <select value={assignmentForm.dutyRole} onChange={(e) => setAssignmentForm((p) => ({ ...p, dutyRole: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
              <option value="front_desk">Lễ tân</option>
              <option value="security">Bảo vệ</option>
              <option value="maintenance">Bảo trì</option>
              <option value="supervisor">Giám sát</option>
            </select>
            <button type="submit" disabled={savingAssignment} className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60 sm:col-span-3">
              {savingAssignment ? "Đang phân công..." : "Phân công"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#eef1f8] pt-3">
            <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
              Từ ngày
              <input type="date" value={rosterRange.fromDate} onChange={(e) => setRosterRange((p) => ({ ...p, fromDate: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]" />
            </label>
            <label className="flex flex-col gap-1 text-[9px] font-semibold text-[#3a475a]">
              Đến ngày
              <input type="date" value={rosterRange.toDate} onChange={(e) => setRosterRange((p) => ({ ...p, toDate: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px]" />
            </label>
            <button type="button" onClick={loadRoster} className="rounded-[8px] border border-[#dfe7f5] px-3 py-1.5 text-[10px] font-semibold text-[#3a475a]">Lọc lịch trực</button>
          </div>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {loadingRoster ? (
              <p className="text-[11px] text-[#8996a9]">Đang tải...</p>
            ) : roster.length === 0 ? (
              <p className="text-[11px] text-[#8996a9]">Chưa có lịch trực nào.</p>
            ) : (
              roster.map((entry, index) => (
                <div key={`${entry.shiftId}-${entry.employeeId}-${index}`} className="rounded-[10px] border border-[#eef1f8] p-2.5 text-[11px]">
                  <div className="font-semibold">{entry.employeeName} <span className="font-normal text-[#8996a9]">({entry.dutyRole})</span></div>
                  <div className="text-[9px] text-[#8996a9]">{entry.shiftName} • {formatDateTime(entry.startsAt)} → {formatDateTime(entry.endsAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ManagerShifts;

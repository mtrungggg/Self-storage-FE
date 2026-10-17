import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

const emptyTaskForm = { taskType: "general", title: "", dueAt: "", assignedEmployeeId: "" };

function ManagerDashboard() {
  const { facilityId, activeFacility } = useManagerFacility();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [taskSaving, setTaskSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!facilityId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    managerService
      .getDashboard(facilityId)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không thể tải dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  async function submitTask(event) {
    event.preventDefault();
    if (!facilityId) return;
    setTaskSaving(true);
    setError("");
    try {
      await managerService.createTask(facilityId, {
        taskType: taskForm.taskType,
        title: taskForm.title,
        dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : undefined,
        assignedEmployeeId: taskForm.assignedEmployeeId ? Number(taskForm.assignedEmployeeId) : undefined,
      });
      setNotice("Đã giao việc mới.");
      setShowTaskForm(false);
      setTaskForm(emptyTaskForm);
    } catch (err) {
      setError(err?.message || "Không thể tạo công việc.");
    } finally {
      setTaskSaving(false);
    }
  }

  const kpis = dashboard
    ? [
        { id: "total", label: "Tổng ô kho", value: dashboard.totalUnits },
        { id: "occupied", label: "Đang thuê", value: dashboard.occupiedUnits },
        { id: "reserved", label: "Đã đặt trước", value: dashboard.reservedUnits },
        { id: "available", label: "Còn trống", value: dashboard.availableUnits },
        { id: "maintenance", label: "Bảo trì", value: dashboard.maintenanceUnits },
        { id: "occupancy", label: "Tỷ lệ lấp đầy", value: `${(dashboard.occupancyRate * 100).toFixed(1)}%` },
      ]
    : [];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">Dashboard Kho {activeFacility ? `— ${activeFacility.name}` : ""}</h1>
          <p className="mt-1 text-[11px] text-[#8996a9]">Tổng quan vận hành theo thời gian thực cho kho đang chọn.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3 py-2 text-[11px] font-bold text-white"
        >
          <span className="material-symbols-outlined text-[15px]">add_task</span>
          Giao việc mới
        </button>
      </div>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      {loading ? (
        <p className="mt-5 text-[11px] text-[#8996a9]">Đang tải dashboard...</p>
      ) : !dashboard ? (
        <p className="mt-5 text-[11px] text-[#8996a9]">Chưa có dữ liệu.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
                <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">{kpi.label}</div>
                <div className="mt-1 text-[19px] font-bold">{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold">Lịch trình hôm nay</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[18px] font-bold text-[#1d5fe5]">{dashboard.dailySchedule?.todayCheckInsCount ?? 0}</div>
                  <div className="text-[9px] text-[#8996a9]">Check-in</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[18px] font-bold text-[#1d5fe5]">{dashboard.dailySchedule?.todayCheckOutsCount ?? 0}</div>
                  <div className="text-[9px] text-[#8996a9]">Check-out</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[18px] font-bold text-[#1d5fe5]">{dashboard.dailySchedule?.todayInspectionsCount ?? 0}</div>
                  <div className="text-[9px] text-[#8996a9]">Kiểm tra</div>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold">Tài chính &amp; Hỗ trợ</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[9px] text-[#8996a9]">Doanh thu tháng này</div>
                  <div className="mt-0.5 text-[14px] font-bold text-[#0e7b4c]">{formatVnd(dashboard.thisMonthRevenue)}</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[9px] text-[#8996a9]">Công nợ chưa thu</div>
                  <div className="mt-0.5 text-[14px] font-bold text-[#c0362c]">{formatVnd(dashboard.totalOutstandingDebt)}</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[9px] text-[#8996a9]">Ticket đang mở</div>
                  <div className="mt-0.5 text-[14px] font-bold">{dashboard.openTicketsCount}</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="text-[9px] text-[#8996a9]">Ticket khẩn cấp</div>
                  <div className="mt-0.5 text-[14px] font-bold text-[#c0362c]">{dashboard.urgentTicketsCount}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showTaskForm && (
        <dialog open className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-xl backdrop:bg-black/40">
          <form onSubmit={submitTask}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold">Giao việc mới</h2>
              <button type="button" onClick={() => setShowTaskForm(false)} className="text-[11px] font-semibold text-[#58657a] underline">Đóng</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Loại công việc *
                <select value={taskForm.taskType} onChange={(e) => setTaskForm((prev) => ({ ...prev, taskType: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
                  <option value="general">Chung</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="inspection">Kiểm tra</option>
                  <option value="support_ticket">Hỗ trợ khách hàng</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Tiêu đề *
                <input required value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Mã nhân viên được giao (tuỳ chọn)
                <input type="number" min="1" value={taskForm.assignedEmployeeId} onChange={(e) => setTaskForm((prev) => ({ ...prev, assignedEmployeeId: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Hạn hoàn thành (tuỳ chọn)
                <input type="datetime-local" value={taskForm.dueAt} onChange={(e) => setTaskForm((prev) => ({ ...prev, dueAt: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
            </div>
            <button type="submit" disabled={taskSaving} className="mt-4 w-full rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white disabled:opacity-60">
              {taskSaving ? "Đang giao việc..." : "Giao việc"}
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}

export default ManagerDashboard;

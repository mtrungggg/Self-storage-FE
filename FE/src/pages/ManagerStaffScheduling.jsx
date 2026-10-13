import { Fragment, useEffect, useState } from "react";
import managerService from "../api/managerService";

// Generates a random, reasonably strong temporary password (shown once to the manager to share with the new staff member).
function generateStaffPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%";
  const all = upper + lower + digits + symbols;
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest = Array.from({ length: 6 }, () => pick(all));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

const SHIFT_LABEL = {
  morning: "Ca Sáng (07-15h)",
  afternoon: "Ca Chiều (15-23h)",
  night: "Ca Đêm (23-07h)",
  off: "NGHỈ (OFF)",
};

const SHIFT_SHORT = {
  morning: "Sáng",
  afternoon: "Chiều",
  night: "Đêm",
  off: "OFF",
};

const SHIFT_STYLES = {
  morning: "bg-[#eef4ff] text-[#1d5fe5] border border-[#bfd5ff]",
  afternoon: "bg-[#1d5fe5] text-white",
  night: "bg-[#0b1c30] text-white",
  off: "border border-dashed border-[#dfe7f5] text-[#8996a9] bg-white",
};

const ATTENDANCE_DOT = {
  present: "#0e7b4c",
  assigned: "#1d5fe5",
  late: "#f59e0b",
  absent: "#e02424",
  excused: "#8996a9",
};

const TASK_STATUS_BADGE = {
  done: "bg-[#e7f8ee] text-[#0e7b4c]",
  in_progress: "bg-[#eef4ff] text-[#1d5fe5]",
  todo: "bg-[#fff2d8] text-[#a15c00]",
  blocked: "bg-[#fde8e8] text-[#c81e1e]",
};

const TASK_STATUS_LABEL = {
  done: "Hoàn thành",
  in_progress: "Đang thực hiện",
  todo: "Chờ thực hiện",
  blocked: "Tạm dừng / Vướng",
};

function ManagerStaffScheduling() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [facilityId, setFacilityId] = useState(1);
  const [shiftsList, setShiftsList] = useState([]);

  // Modal for creating a new shift definition (Swagger API #9)
  const [shiftDefModalOpen, setShiftDefModalOpen] = useState(false);
  const [shiftDefForm, setShiftDefForm] = useState(() => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return {
      shiftName: "Ca Trực Tăng Cường",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      status: "open",
    };
  });

  // Modal for assigning/editing a shift cell
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    facilityId: "",
    employeeId: "",
    staffName: "",
    dayKey: "mon",
    date: "",
    dayLabel: "",
    shiftType: "morning",
    dutyRole: "Trực vận hành kho",
    attendanceStatus: "assigned",
  });

  // Modal for adding a new staff member
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    employeeCode: "",
    roleCode: "facility_staff",
    facilityId: "",
    password: "",
  });

  // Modal for creating/editing a field task
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    facilityId: "",
    assignedEmployeeId: "",
    title: "",
    taskType: "inspection",
    status: "todo",
    progressPercent: 0,
  });

  const showToast = (msg, duration = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(""), duration);
  };

  const fetchStaffing = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await managerService.getStaffingOverview(facilityId);
      const payload = res?.data || res;
      setData(payload);

      // Swagger API #8: GET /manager/facilities/{facilityId}/shifts
      try {
        const shiftRes = await managerService.getShifts(facilityId);
        if (shiftRes?.data) setShiftsList(shiftRes.data);
      } catch (sErr) {
        console.warn("Could not load shifts:", sErr);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu phân công lịch nhân viên từ SQL Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initFacilities() {
      try {
        const facRes = await managerService.getFacilities();
        if (Array.isArray(facRes?.data) && facRes.data.length > 0) {
          setFacilityId((prev) => (prev ? prev : facRes.data[0].id));
        }
      } catch (err) {
        console.warn("Could not load facilities:", err);
      }
    }
    initFacilities();
  }, []);

  useEffect(() => {
    fetchStaffing();
  }, [facilityId]);

  const kpis = data?.kpis || {};
  const weekDays = data?.weekDays || [];
  const staffRows = data?.staffRoster || [];
  const tasks = data?.tasks || [];
  const facilities = data?.facilities || [];

  // Group staff by department
  const departmentsMap = {};
  staffRows.forEach((row) => {
    const dept = row.department || "FIELD OPERATIONS & LOGISTICS";
    if (!departmentsMap[dept]) departmentsMap[dept] = [];
    departmentsMap[dept].push(row);
  });
  const departmentEntries = Object.entries(departmentsMap);

  const openShiftCellModal = (member, day) => {
    const currentCell = member.shiftsByDay?.[day.key] || {
      shiftType: "off",
      dutyRole: member.roleLabel || "Trực vận hành kho",
      attendanceStatus: "assigned",
    };
    setShiftForm({
      facilityId: member.facilityIds?.[0] || facilities[0]?.id || "",
      employeeId: member.employeeId,
      staffName: member.fullName,
      dayKey: day.key,
      date: day.fullDate,
      dayLabel: `${day.label} (${day.dateLabel})`,
      shiftType: currentCell.shiftType || "morning",
      dutyRole: currentCell.dutyRole || member.roleLabel || "Trực vận hành kho",
      attendanceStatus: currentCell.attendanceStatus || "assigned",
    });
    setShiftModalOpen(true);
  };

  const openNewShiftButton = () => {
    const firstMember = staffRows[0];
    const firstDay =
      weekDays.find((d) => d.isToday) ||
      weekDays[0] || { key: "mon", label: "MON", dateLabel: "", fullDate: new Date().toISOString().slice(0, 10) };
    if (firstMember) {
      openShiftCellModal(firstMember, firstDay);
    }
  };

  const handleCreateShiftDef = async (e) => {
    e.preventDefault();
    try {
      await managerService.createShift(facilityId, {
        shiftName: shiftDefForm.shiftName,
        startsAt: shiftDefForm.startsAt,
        endsAt: shiftDefForm.endsAt,
        status: shiftDefForm.status || "open",
      });
      setShiftDefModalOpen(false);
      showToast(`Đã tạo khung ca trực "${shiftDefForm.shiftName}" trên Database!`);
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Không thể tạo khung ca trực");
    }
  };

  const handleSaveShiftCell = async (e) => {
    e.preventDefault();
    if (!shiftForm.facilityId) {
      alert("Không xác định được cơ sở làm việc của nhân viên này.");
      return;
    }
    try {
      // Swagger API #11: POST /manager/facilities/{facilityId}/shift-assignments
      try {
        const matchedShift =
          shiftsList.find((s) => {
            const sName = (s.shiftName || "").toLowerCase();
            const curType = (shiftForm.shiftType || "").toLowerCase();
            if (curType === "morning" && (sName.includes("sáng") || sName.includes("morning"))) return true;
            if (curType === "afternoon" && (sName.includes("chiều") || sName.includes("afternoon"))) return true;
            if (curType === "night" && (sName.includes("tối") || sName.includes("đêm") || sName.includes("night"))) return true;
            return false;
          }) || shiftsList[0];
        const assignedShiftId = matchedShift?.id || matchedShift?.shiftId || 1;

        await managerService.assignShift(Number(shiftForm.facilityId), {
          shiftId: Number(assignedShiftId),
          employeeId: Number(shiftForm.employeeId),
          dutyRole: shiftForm.dutyRole || "staff",
          status: shiftForm.attendanceStatus || "scheduled",
        });
      } catch (e11) {
        console.warn("API 11 assignShift:", e11);
      }

      await managerService.assignStaffCellShift({
        facilityId: Number(shiftForm.facilityId),
        employeeId: Number(shiftForm.employeeId),
        date: shiftForm.date,
        shiftType: shiftForm.shiftType,
        dutyRole: shiftForm.dutyRole || "Trực vận hành kho",
        attendanceStatus: shiftForm.attendanceStatus || "assigned",
      });
      setShiftModalOpen(false);
      showToast(`Đã lưu phân công ca (${SHIFT_SHORT[shiftForm.shiftType]}) cho ${shiftForm.staffName} vào Database!`);
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Lỗi khi phân công ca trực");
    }
  };

  const handleCreateStaffMember = async (e) => {
    e.preventDefault();
    if (!newStaffForm.facilityId) {
      alert("Vui lòng chọn cơ sở làm việc cho nhân viên.");
      return;
    }
    if (!newStaffForm.password || newStaffForm.password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự. Nhấn \"Tạo mã\" để sinh mật khẩu ngẫu nhiên.");
      return;
    }
    try {
      await managerService.createStaffMember({
        fullName: newStaffForm.fullName,
        email: newStaffForm.email,
        phoneNumber: newStaffForm.phoneNumber,
        employeeCode: newStaffForm.employeeCode || null,
        roleCode: newStaffForm.roleCode || "facility_staff",
        facilityId: Number(newStaffForm.facilityId),
        password: newStaffForm.password,
      });
      setStaffModalOpen(false);
      const createdPassword = newStaffForm.password;
      setNewStaffForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        employeeCode: "",
        roleCode: "facility_staff",
        facilityId: "",
        password: "",
      });
      showToast(`Đã thêm nhân viên mới! Mật khẩu tạm: ${createdPassword} (hãy gửi cho nhân viên và yêu cầu đổi sau khi đăng nhập)`, 15000);
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Không thể thêm nhân viên mới");
    }
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      facilityId: facilities[0]?.id || "",
      assignedEmployeeId: staffRows[0]?.employeeId || "",
      title: "",
      taskType: "inspection",
      status: "todo",
      progressPercent: 0,
    });
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      facilityId: task.facilityId || "",
      assignedEmployeeId: task.assignedEmployeeId || "",
      title: task.title,
      taskType: task.taskType || "inspection",
      status: task.status || "todo",
      progressPercent: task.progressPercent ?? 0,
    });
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.facilityId) {
      alert("Vui lòng chọn cơ sở cho nhiệm vụ.");
      return;
    }
    try {
      const payload = {
        facilityId: Number(taskForm.facilityId),
        assignedEmployeeId: taskForm.assignedEmployeeId ? Number(taskForm.assignedEmployeeId) : null,
        ticketId: editingTask?.ticketId || null,
        taskType: taskForm.taskType,
        title: taskForm.title,
        dueAt: null,
        status: taskForm.status,
        progressPercent:
          taskForm.status === "done"
            ? 100
            : taskForm.status === "todo"
            ? 0
            : Math.min(95, Math.max(10, Number(taskForm.progressPercent || 50))),
      };
      if (editingTask) {
        await managerService.updateStaffTask(editingTask.id, payload);
        showToast("Đã cập nhật nhiệm vụ nhân viên trong Database!");
      } else {
        // Swagger API #12: POST /manager/facilities/{facilityId}/tasks
        await managerService.createStaffTask(Number(taskForm.facilityId), payload);
        showToast("Đã giao nhiệm vụ mới cho nhân viên trong Database!");
      }
      setTaskModalOpen(false);
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Lỗi khi lưu nhiệm vụ");
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    const nextProgress = nextStatus === "done" ? 100 : nextStatus === "in_progress" ? 50 : 0;
    try {
      await managerService.updateStaffTask(task.id, {
        facilityId: task.facilityId,
        assignedEmployeeId: task.assignedEmployeeId,
        ticketId: task.ticketId,
        taskType: task.taskType,
        title: task.title,
        dueAt: task.dueAt,
        status: nextStatus,
        progressPercent: nextProgress,
      });
      showToast(`Đã chuyển nhiệm vụ "${task.title}" sang ${TASK_STATUS_LABEL[nextStatus]}!`);
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Không thể đổi trạng thái nhiệm vụ");
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Xóa nhiệm vụ "${task.title}" khỏi Database?`)) return;
    try {
      await managerService.deleteStaffTask(task.id);
      showToast("Đã xóa nhiệm vụ khỏi Database!");
      await fetchStaffing();
    } catch (err) {
      alert(err.message || "Lỗi khi xóa nhiệm vụ");
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed right-5 bottom-5 z-50 flex max-w-[420px] items-center gap-2 rounded-[10px] bg-[#0b1c30] px-4 py-2.5 text-[12px] font-bold text-white shadow-lg">
          <span className="material-symbols-outlined text-[16px] text-[#35d288]">check_circle</span>
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold">Phân Công Lịch Staff</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4a0]" />
            Live
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#58657a]">
            <span>Cơ sở:</span>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
              className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0b1c30] outline-none"
            >
              {facilities.length > 0 ? (
                facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code})
                  </option>
                ))
              ) : (
                <option value={facilityId}>Cơ sở #{facilityId}</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#3a475a]">
            <span className="material-symbols-outlined text-[13px] text-[#1d5fe5]">calendar_today</span>
            {data?.weekRangeLabel || "Tuần hiện tại"}
          </div>

          <button
            onClick={() => setShiftDefModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f8faff]"
          >
            <span className="material-symbols-outlined text-[15px]">more_time</span>
            Tạo khung ca (API #9)
          </button>

          <button
            onClick={() => {
              setNewStaffForm({
                fullName: "",
                email: "",
                phoneNumber: "",
                employeeCode: "",
                roleCode: "facility_staff",
                facilityId: facilities[0]?.id || "",
                password: generateStaffPassword(),
              });
              setStaffModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f8faff]"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            Thêm nhân viên
          </button>

          <button
            onClick={openNewShiftButton}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(29,95,229,0.22)] hover:bg-[#164dc0]"
          >
            <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
            Phân công ca
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-[10px] border border-[#f8b4b4] bg-[#fde8e8] p-3 text-[11px] font-semibold text-[#c81e1e]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Tổng Nhân Sự Kho
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">groups</span>
          </div>
          <div className="mt-1 text-[19px] font-bold">{kpis.totalStaff ?? 0}</div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Đang Trực Hôm Nay
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">location_on</span>
          </div>
          <div className="mt-1 text-[19px] font-bold">
            {kpis.onDutyToday ?? 0} / {kpis.totalStaff ?? 0}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Nhiệm Vụ Đã Hoàn Tất
            <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">task_alt</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[19px] font-bold text-[#0e7b4c]">
              {kpis.completedTasks ?? 0} / {kpis.totalTasks ?? 0}
            </span>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Tổng Số Ca Trong Tuần
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">verified</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[19px] font-bold">{kpis.totalWeeklyShifts ?? 0} Ca</span>
          </div>
        </div>
      </div>

      {/* Weekly Shift Table */}
      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[14px] font-bold">Lịch Trực Tuần</div>
          </div>
          <span className="rounded-full bg-[#0b1c30] px-2.5 py-1 text-[10px] font-bold text-white">
            Tuần: {data?.weekRangeLabel}
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Nhân viên / Chức danh</th>
                {weekDays.map((day) => (
                  <th key={day.key} className={`py-2 px-1 text-center ${day.isToday ? "text-[#1d5fe5]" : ""}`}>
                    {day.isToday ? `HÔM NAY (${day.label})` : day.label}
                    <div className="font-semibold normal-case">{day.dateLabel}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8996a9]">
                    Đang tải bảng phân công lịch từ SQL Server...
                  </td>
                </tr>
              ) : (
                departmentEntries.map(([deptName, members]) => (
                  <Fragment key={deptName}>
                    <tr className="bg-[#f8faff]">
                      <td colSpan={weekDays.length + 1} className="py-1.5 pr-2 pl-2 text-[9px] font-bold uppercase tracking-[0.04em] text-[#58657a]">
                        {deptName} ({String(members.length).padStart(2, "0")} Nhân viên)
                      </td>
                    </tr>
                    {members.map((member) => (
                      <tr key={member.employeeId} className="border-b border-[#f2f5fb] hover:bg-[#fcfdff]">
                        <td className="py-2 pr-2">
                          <div className="font-semibold text-[#0b1c30]" title={`${member.roleLabel} • #${member.employeeCode}`}>{member.fullName}</div>
                        </td>
                        {weekDays.map((day) => {
                          const cell = member.shiftsByDay?.[day.key] || { shiftType: "off" };
                          const shiftType = cell.shiftType || "off";
                          return (
                            <td key={day.key} className="px-1 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => openShiftCellModal(member, day)}
                                title={cell.dutyRole ? `${cell.dutyRole} — Bấm để đổi ca` : "Bấm để phân công / đổi ca trực"}
                                className={`group relative mx-auto flex w-[76px] items-center justify-center gap-1 rounded-[6px] px-1.5 py-1.5 text-[9px] font-bold transition hover:scale-105 hover:shadow-sm ${
                                  SHIFT_STYLES[shiftType] || SHIFT_STYLES.off
                                }`}
                              >
                                {shiftType !== "off" && (
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: ATTENDANCE_DOT[cell.attendanceStatus] || "#35d288" }}
                                  />
                                )}
                                <span>{SHIFT_SHORT[shiftType] || "OFF"}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#eef1f8] pt-2 text-[10px] font-semibold text-[#58657a]">
          <span className="text-[9px] font-bold uppercase text-[#8996a9]">Chú thích Ca trực:</span>
          <span className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${SHIFT_STYLES.morning}`} />
            Ca Sáng (07:00 - 15:00)
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${SHIFT_STYLES.afternoon}`} />
            Ca Chiều (15:00 - 23:00)
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${SHIFT_STYLES.night}`} />
            Ca Đêm (23:00 - 07:00)
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${SHIFT_STYLES.off}`} />
            Nghỉ (OFF)
          </span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-bold">Nhiệm Vụ Hiện Trường</div>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
              {kpis.completedTasks ?? 0}/{kpis.totalTasks ?? 0} hoàn thành
            </span>
          </div>
          <button
            onClick={openCreateTaskModal}
            className="flex items-center gap-1 rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#164dc0]"
          >
            <span className="material-symbols-outlined text-[14px]">add_task</span>
            Giao việc
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    title="Bấm để chuyển nhanh trạng thái"
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                      task.status === "done"
                        ? "border-[#0e7b4c] bg-[#0e7b4c] text-white"
                        : "border-[#8996a9] bg-white text-[#8996a9]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </button>
                  <div>
                    <div className="text-[12px] font-bold text-[#0b1c30]">{task.title}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold ${TASK_STATUS_BADGE[task.status] || TASK_STATUS_BADGE.todo}`}>
                    {TASK_STATUS_LABEL[task.status] || task.status}
                  </span>
                  <button
                    onClick={() => openEditTaskModal(task)}
                    className="rounded-[6px] border border-[#dfe7f5] bg-white p-1 text-[#1d5fe5] hover:bg-[#eef4ff]"
                    title="Chỉnh sửa nhiệm vụ"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="rounded-[6px] border border-[#f8b4b4] bg-white p-1 text-[#c81e1e] hover:bg-[#fde8e8]"
                    title="Xóa nhiệm vụ"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between border-t border-[#e7edf8] pt-2 text-[10px] text-[#3a475a]">
                <div>
                  Người thực hiện: <strong className="text-[#1d5fe5]">{task.assignedEmployeeName || "Chưa giao"}</strong> •{" "}
                  <span className="uppercase text-[9px] text-[#8996a9]">{task.taskType}</span>
                </div>
                <div className="font-bold text-[#0e7b4c]">Tiến độ: {task.progressPercent}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Assign Shift Cell */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h3 className="text-[15px] font-bold">Phân Công Ca Trực Nhân Viên</h3>
              <button onClick={() => setShiftModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveShiftCell} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Nhân viên *</label>
                  <select
                    value={shiftForm.employeeId}
                    onChange={(e) => {
                      const st = staffRows.find((s) => s.employeeId === Number(e.target.value));
                      setShiftForm({
                        ...shiftForm,
                        employeeId: e.target.value,
                        staffName: st?.fullName || "",
                      });
                    }}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    {staffRows.map((s) => (
                      <option key={s.employeeId} value={s.employeeId}>
                        {s.fullName} (#{s.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Ngày trong tuần *</label>
                  <select
                    value={shiftForm.dayKey}
                    onChange={(e) => {
                      const d = weekDays.find((w) => w.key === e.target.value);
                      setShiftForm({
                        ...shiftForm,
                        dayKey: e.target.value,
                        date: d?.fullDate || shiftForm.date,
                        dayLabel: d ? `${d.label} (${d.dateLabel})` : e.target.value,
                      });
                    }}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    {weekDays.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label} ({d.dateLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Chọn Ca Trực *</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {["morning", "afternoon", "night", "off"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setShiftForm({ ...shiftForm, shiftType: type })}
                      className={`rounded-[8px] border px-3 py-2 text-left text-[11px] font-bold transition ${
                        shiftForm.shiftType === type
                          ? "border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5] ring-2 ring-[#1d5fe5]/20"
                          : "border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
                      }`}
                    >
                      {SHIFT_LABEL[type]}
                    </button>
                  ))}
                </div>
              </div>

              {shiftForm.shiftType !== "off" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#3a475a]">Vai trò / Ghi chú ca trực</label>
                    <input
                      type="text"
                      value={shiftForm.dutyRole}
                      onChange={(e) => setShiftForm({ ...shiftForm, dutyRole: e.target.value })}
                      className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#3a475a]">Trạng thái điểm danh</label>
                    <select
                      value={shiftForm.attendanceStatus}
                      onChange={(e) => setShiftForm({ ...shiftForm, attendanceStatus: e.target.value })}
                      className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                    >
                      <option value="assigned">Đã phân ca (Assigned)</option>
                      <option value="present">Có mặt đúng giờ (Present)</option>
                      <option value="late">Đi trễ (Late)</option>
                      <option value="absent">Vắng mặt (Absent)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setShiftModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#164dc0]"
                >
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create New Staff Member */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h3 className="text-[15px] font-bold">Thêm Nhân Viên Kho Mới</h3>
              <button onClick={() => setStaffModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStaffMember} className="mt-4 space-y-3 text-[11px]">
              <div>
                <label className="font-bold text-[#3a475a]">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  required
                  value={newStaffForm.fullName}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Minh Khôi"
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    placeholder="staff.khoi@example.test"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.phoneNumber}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phoneNumber: e.target.value })}
                    placeholder="0909123456"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Vai trò nhân sự *</label>
                  <select
                    value={newStaffForm.roleCode}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, roleCode: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="facility_staff">Nhân viên vận hành kho</option>
                    <option value="facility_manager">Quản lý cơ sở</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Cơ sở làm việc *</label>
                  <select
                    value={newStaffForm.facilityId}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, facilityId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Mật khẩu tạm thời *</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                    placeholder="Nhập hoặc tạo mật khẩu ngẫu nhiên"
                    className="w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStaffForm((prev) => ({ ...prev, password: generateStaffPassword() }))}
                    className="shrink-0 rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-2 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                    title="Tạo mật khẩu ngẫu nhiên"
                  >
                    Tạo mã
                  </button>
                </div>
                <p className="mt-1 text-[9px] text-[#8996a9]">Gửi mật khẩu này cho nhân viên qua kênh riêng tư; họ nên đổi lại sau lần đăng nhập đầu tiên.</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#164dc0]"
                >
                  Tạo Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create / Edit Field Task */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h3 className="text-[15px] font-bold">
                {editingTask ? "Cập Nhật Nhiệm Vụ Nhân Viên" : "Giao Nhiệm Vụ Hiện Trường Mới"}
              </h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-3 text-[11px]">
              <div>
                <label className="font-bold text-[#3a475a]">Tiêu đề / Nội dung nhiệm vụ *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="VD: Kiểm định khóa thông minh & cảm biến nhiệt Khu B..."
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Cơ sở *</label>
                  <select
                    value={taskForm.facilityId}
                    onChange={(e) => setTaskForm({ ...taskForm, facilityId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Giao cho nhân viên *</label>
                  <select
                    value={taskForm.assignedEmployeeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedEmployeeId: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    {staffRows.map((s) => (
                      <option key={s.employeeId} value={s.employeeId}>
                        {s.fullName} ({s.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Loại công việc *</label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="inspection">Inspection (Kiểm định kho)</option>
                    <option value="maintenance">Maintenance (Bảo trì kỹ thuật)</option>
                    <option value="move_out">Move-out (Nghiệm thu trả kho)</option>
                    <option value="security">Security (Tuần tra an ninh)</option>
                    <option value="cleaning">Cleaning (Vệ sinh &amp; Khử khuẩn)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Trạng thái *</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value,
                        progressPercent:
                          e.target.value === "done" ? 100 : e.target.value === "todo" ? 0 : 50,
                      })
                    }
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  >
                    <option value="todo">Chờ thực hiện (To Do)</option>
                    <option value="in_progress">Đang thực hiện (In Progress)</option>
                    <option value="done">Hoàn thành (Done - 100%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#3a475a]">Tiến độ (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={taskForm.status === "done" ? 100 : taskForm.progressPercent}
                    onChange={(e) => setTaskForm({ ...taskForm, progressPercent: e.target.value })}
                    disabled={taskForm.status === "done"}
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#164dc0]"
                >
                  {editingTask ? "Lưu Cập Nhật" : "Giao Nhiệm Vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Create Shift Definition (Swagger API #9) */}
      {shiftDefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <div>
                <h3 className="text-[15px] font-bold">Tạo Khung Giờ Ca Trực Mới</h3>
                <p className="text-[10px] text-[#8996a9]">
                  Swagger API #9: POST /manager/facilities/{facilityId}/shifts
                </p>
              </div>
              <button
                onClick={() => setShiftDefModalOpen(false)}
                className="text-[#8996a9] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateShiftDef} className="mt-4 space-y-3 text-[11px]">
              <div>
                <label className="font-bold text-[#3a475a]">Tên khung ca trực *</label>
                <input
                  type="text"
                  required
                  value={shiftDefForm.shiftName}
                  onChange={(e) =>
                    setShiftDefForm({ ...shiftDefForm, shiftName: e.target.value })
                  }
                  placeholder="VD: Ca Trực Đêm 23:00 - 07:00"
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Bắt đầu (Starts At) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={shiftDefForm.startsAt.slice(0, 16)}
                    onChange={(e) =>
                      setShiftDefForm({
                        ...shiftDefForm,
                        startsAt: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Kết thúc (Ends At) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={shiftDefForm.endsAt.slice(0, 16)}
                    onChange={(e) =>
                      setShiftDefForm({
                        ...shiftDefForm,
                        endsAt: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Trạng thái khung ca</label>
                <select
                  value={shiftDefForm.status}
                  onChange={(e) =>
                    setShiftDefForm({ ...shiftDefForm, status: e.target.value })
                  }
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                >
                  <option value="open">Đang mở đăng ký (Open)</option>
                  <option value="closed">Đã chốt danh sách (Closed)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setShiftDefModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#164dc0]"
                >
                  Tạo Khung Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerStaffScheduling;

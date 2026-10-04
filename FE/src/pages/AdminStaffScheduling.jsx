import { Fragment } from "react";
import { useStaffScheduling } from "../hooks/useStaffScheduling";

const SHIFT_LABEL = { morning: "Sáng", afternoon: "Chiều", night: "Đêm", off: "OFF" };
const SHIFT_STYLES = {
  morning: "bg-[#f0f3fa] text-[#3a475a]",
  afternoon: "bg-[#1d5fe5] text-white",
  night: "bg-[#0b1c30] text-white",
  off: "border border-dashed border-[#dfe7f5] text-[#8996a9]",
};
const TASK_STATUS_BADGE = {
  done: "bg-[#e7f8ee] text-[#0e7b4c]",
  doing: "bg-[#eef4ff] text-[#1d5fe5]",
  waiting: "bg-[#fff2d8] text-[#a15c00]",
};
const TASK_STATUS_ICON = { done: "check_circle", doing: "sync", waiting: "hourglass_top" };

function AdminStaffScheduling() {
  const {
    statusBanner,
    header,
    weekRangeLabel,
    headerActions,
    kpis,
    onDutyToday,
    totalStaff,
    weekDays,
    departments,
    shiftLegend,
    attendanceLegend,
    fieldTasks,
    tasksLoading,
    updatingTaskId,
    handleUpdateFieldTaskStatus,
    taskProgress,
    handoverTag,
    handoverChecklist,
    checkedHandoverItems,
    toggleHandoverItem,
    handoverNote,
    twoFactorConfirmed,
    setTwoFactorConfirmed,
    canApproveHandover,
  } = useStaffScheduling();

  return (
    <>
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1d5fe5]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1d5fe5]" />
        {statusBanner.label}
        <span className="font-semibold normal-case text-[#8996a9]">• {statusBanner.week}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <p className="mt-1 max-w-[520px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] px-2 py-1.5 text-[10px] font-semibold text-[#3a475a]">
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {weekRangeLabel}
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "new_shift" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Nhân lực toàn Hub
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">groups</span>
          </div>
          <div className="mt-1 text-[19px] font-bold">{totalStaff}</div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">Sẵn sàng điều động • 100% khả dụng</div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Đang trực hiện trường
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">location_on</span>
          </div>
          <div className="mt-1 text-[19px] font-bold">{onDutyToday} / {totalStaff}</div>
          <div className="mt-0.5 text-[10px] text-[#8996a9]">Ca Chiều (15:00 - 23:00)</div>
        </div>

        {kpis.slice(1).map((kpi) => (
          <div key={kpi.id} className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
              {kpi.label}
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">{kpi.icon}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[19px] font-bold">{kpi.value}</span>
              <span className="text-[10px] font-semibold text-[#0e7b4c]">{kpi.trend}</span>
            </div>
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[14px] font-bold">Bảng Điều phối Ca trực Hàng tuần</div>
            <p className="text-[10px] text-[#8996a9]">Tự động đối soát GPS & Biometric</p>
          </div>
          <span className="rounded-full bg-[#0b1c30] px-2.5 py-1 text-[10px] font-bold text-white">
            Hôm nay: Thứ 4, 16/10
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Nhân sự / Vai trò</th>
                {weekDays.map((day) => (
                  <th key={day.id} className={`py-2 px-1 text-center ${day.isToday ? "text-[#1d5fe5]" : ""}`}>
                    {day.isToday ? "HÔM NAY" : day.label}
                    <div className="font-semibold normal-case">{day.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <Fragment key={department.id}>
                  <tr className="bg-[#f8faff]">
                    <td colSpan={weekDays.length + 1} className="py-1.5 pr-2 text-[9px] font-bold uppercase tracking-[0.04em] text-[#58657a]">
                      {department.label} ({String(department.count).padStart(2, "0")} NV)
                    </td>
                  </tr>
                  {department.staff.map((member) => (
                    <tr key={member.id} className="border-b border-[#f2f5fb]">
                      <td className="py-2 pr-2">
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-[9px] text-[#8996a9]">{member.role} • #{member.id}</div>
                      </td>
                      {weekDays.map((day) => {
                        const shift = member.shifts[day.id];
                        return (
                          <td key={day.id} className="px-1 py-2 text-center">
                            <div className={`mx-auto w-[64px] rounded-[6px] px-1 py-1 text-[9px] font-bold ${SHIFT_STYLES[shift.type]}`}>
                              {SHIFT_LABEL[shift.type]}
                            </div>
                            {shift.note && <div className="mt-0.5 truncate text-[8px] text-[#8996a9]">{shift.note}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#eef1f8] pt-2 text-[10px] font-semibold text-[#58657a]">
          <span className="text-[9px] font-bold uppercase text-[#8996a9]">Quy ước màu ca:</span>
          {shiftLegend.map((item) => (
            <span key={item.id} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-[3px] ${SHIFT_STYLES[item.id]}`} />
              {item.label}
            </span>
          ))}
          <span className="text-[9px] font-bold uppercase text-[#8996a9]">Chấm công:</span>
          {attendanceLegend.map((item) => (
            <span key={item.id} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[14px] font-bold">Nhiệm vụ Hiện trường Trong ngày</div>
              <p className="text-[10px] text-[#8996a9]">Phân công cho {onDutyToday} nhân sự ca hôm nay (16/10)</p>
            </div>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5]">
              {taskProgress.completed}/{taskProgress.total} Hoàn tất
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {tasksLoading ? (
              <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-4 text-center text-[11px] text-[#58657a]">
                Đang tải danh sách nhiệm vụ trong ca trực...
              </div>
            ) : fieldTasks.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#dfe7f5] p-4 text-center text-[11px] text-[#8996a9]">
                Hiện không có nhiệm vụ nào được phân công trong ca trực.
              </div>
            ) : (
              fieldTasks.map((task) => (
                <div key={task.id} className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className={`material-symbols-outlined mt-0.5 text-[15px] ${task.status === "done" ? "text-[#0e7b4c]" : "text-[#8996a9]"}`}>
                        {TASK_STATUS_ICON[task.status]}
                      </span>
                      <div className="text-[11px] font-semibold">{task.title}</div>
                    </div>
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold ${TASK_STATUS_BADGE[task.status]}`}>
                      {task.statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 pl-[22px] text-[9px] text-[#8996a9]">{task.note}</div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 pl-[22px] text-[10px] text-[#3a475a]">
                    <div>
                      <span className="font-semibold text-[#1d5fe5]">{task.assignee}</span>
                      <span> • {task.detail}</span>
                    </div>
                    {task.isRealTask && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={Number(updatingTaskId) === Number(task.id) || task.rawStatus === "in_progress"}
                          onClick={() => handleUpdateFieldTaskStatus(task.id, "in_progress", 50)}
                          className="rounded border border-[#1d5fe5] bg-white px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff] disabled:opacity-50"
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          disabled={Number(updatingTaskId) === Number(task.id) || task.rawStatus === "done"}
                          onClick={() => handleUpdateFieldTaskStatus(task.id, "completed", 100)}
                          className="rounded border border-[#0e7b4c] bg-white px-2 py-0.5 text-[9px] font-bold text-[#0e7b4c] hover:bg-[#e7f8ee] disabled:opacity-50"
                        >
                          Completed
                        </button>
                        <button
                          type="button"
                          disabled={Number(updatingTaskId) === Number(task.id) || task.rawStatus === "blocked"}
                          onClick={() => handleUpdateFieldTaskStatus(task.id, "blocked", task.progressPercent || 0)}
                          className="rounded border border-[#c0362c] bg-white px-2 py-0.5 text-[9px] font-bold text-[#c0362c] hover:bg-[#fdecec] disabled:opacity-50"
                        >
                          Blocked
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[10px] text-[#8996a9]">
            <span>Tự động đồng bộ với máy quét mã cầm tay của KTV</span>
            <span className="font-bold text-[#1d5fe5]">+ Thêm nhiệm vụ</span>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-bold">Nhật ký Bàn giao Ca Điện tử</div>
            <span className="rounded-full bg-[#0b1c30] px-2.5 py-1 text-[9px] font-bold text-white">{handoverTag}</span>
          </div>

          <div className="mt-3 space-y-2">
            {handoverChecklist.map((item) => (
              <label key={item.id} className="flex items-start gap-2 rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2.5 text-[11px]">
                <input
                  type="checkbox"
                  checked={checkedHandoverItems.has(item.id)}
                  onChange={() => toggleHandoverItem(item.id)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]"
                />
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="block text-[9px] text-[#8996a9]">{item.detail}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-3 rounded-[8px] border border-dashed border-[#dfe7f5] p-2.5 text-[10px] text-[#58657a]">
            <div className="font-bold uppercase tracking-[0.04em] text-[#8996a9]">Ghi chú ca tiếp theo</div>
            <p className="mt-1">{handoverNote}</p>
          </div>

          <label className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[#3a475a]">
            <input
              type="checkbox"
              checked={twoFactorConfirmed}
              onChange={(event) => setTwoFactorConfirmed(event.target.checked)}
              className="h-3.5 w-3.5 accent-[#1d5fe5]"
            />
            Xác thực 2 chữ ký số
          </label>

          <button
            disabled={!canApproveHandover}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c7d1e6]"
          >
            <span className="material-symbols-outlined text-[14px]">draw</span>
            Ký Duyệt Bàn Giao Ca
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminStaffScheduling;

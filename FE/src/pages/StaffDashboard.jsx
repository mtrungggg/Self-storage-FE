import { useStaffDashboard } from "../hooks/useStaffDashboard";

const STATUS_STYLES = {
  available: "border-[#2dd4a0] bg-[#effcf6]",
  occupied: "border-[#dfe7f5] bg-white",
  handover: "border-[#f5a524] bg-[#fff8ec] ring-2 ring-[#f5a524]/30",
  alert: "border-[#e5484d] bg-[#fdecec]",
};

function StaffDashboard() {
  const {
    profile,
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    facilityLoading,
    navTabs,
    activeNavTab,
    setActiveNavTab,
    currentTime,
    kpis,
    zones,
    activeZone,
    setActiveZone,
    filteredUnits,
    legendWithCounts,
    reservations,
    selectedReservationId,
    setSelectedReservationId,
    handover,
    scheduleTabs,
    activeScheduleTab,
    setActiveScheduleTab,
    filteredSchedule,

    // Daily Staff Tasks (Flow 5)
    tasksLoading,
    tasksError,
    taskProgress,
    updatingTaskId,
    taskActionFeedback,
    fetchStaffTasks,
    handleUpdateTaskStatus,
  } = useStaffDashboard();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <header className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1d5fe5] text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">warehouse</span>
            </div>
            <span className="hidden text-[16px] tracking-tight sm:block">
              <span className="font-black text-[#0a3d91]">G1</span>
              <span className="font-bold text-[#0b1c30]">SelfStorage</span>
            </span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveNavTab(tab.id);
                  if (tab.id === "handover") {
                    const el = document.getElementById("daily-staff-tasks-section");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-semibold transition ${
                  activeNavTab === tab.id
                    ? "bg-[#eef4ff] text-[#1d5fe5]"
                    : "text-[#58657a] hover:bg-[#f5f7fd]"
                }`}
              >
                {tab.label}
                {tab.count ? (
                  <span className="rounded-full bg-[#0b1c30] px-1.5 py-0.5 text-[9px] text-white">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {facilities.length > 0 && (
              <select
                value={selectedFacilityId || ""}
                onChange={(e) =>
                  setSelectedFacilityId(e.target.value ? Number(e.target.value) : null)
                }
                className="rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1 text-[11px] font-semibold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name || fac.code || `Cơ sở #${fac.id}`}
                  </option>
                ))}
              </select>
            )}

            <span className="hidden text-[11px] font-semibold tabular-nums text-[#8996a9] md:block">
              {currentTime}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="hidden leading-tight lg:block">
                <div className="text-[11px] font-bold">{profile.name}</div>
                <div className="text-[9px] text-[#8996a9]">
                  {profile.code ? `${profile.code} • ` : ""}
                  {profile.role} • {profile.facility}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 py-5 lg:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                {kpi.label}
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">
                  {kpi.icon}
                </span>
              </div>
              <div className="mt-1 text-[20px] font-bold">{kpi.value}</div>
              <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[14px] font-bold">
                Sơ đồ mặt bằng ({profile.facility})
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setActiveZone(zone.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                    activeZone === zone.id
                      ? "bg-[#0b1c30] text-white"
                      : "bg-[#f5f7fd] text-[#58657a]"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-3 border-b border-[#eef1f8] pb-3 text-[10px] font-semibold text-[#58657a]">
              {legendWithCounts.map((item) => (
                <span key={item.id} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label} ({item.count})
                </span>
              ))}
            </div>

            {facilityLoading ? (
              <div className="mt-3 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-6 text-center text-[11px] text-[#58657a]">
                Đang tải sơ đồ khoang từ hệ thống...
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="mt-3 rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
                Chưa có dữ liệu khoang nào ở khu vực này.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className={`rounded-[10px] border p-2.5 ${
                      STATUS_STYLES[unit.status] || STATUS_STYLES.available
                    }`}
                  >
                    <div className="text-[11px] font-bold">{unit.id}</div>
                    <div className="text-[9px] text-[#8996a9]">{unit.size}</div>
                    <div className="mt-1 truncate text-[9px] font-semibold text-[#58657a]">
                      {unit.note}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[16px] border border-[#f5a524]/40 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#fff2d8] px-2 py-0.5 text-[9px] font-bold text-[#a15c00]">
                Phiếu đặt giữ chỗ / Bàn giao
              </span>
              {handover && (
                <span className="text-[10px] font-semibold text-[#8996a9]">
                  {handover.code}
                </span>
              )}
            </div>

            {reservations.length > 1 && (
              <div className="mt-2">
                <select
                  value={selectedReservationId || ""}
                  onChange={(e) => setSelectedReservationId(Number(e.target.value))}
                  className="w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[11px] font-semibold text-[#0b1c30] outline-none"
                >
                  {reservations.map((r) => (
                    <option key={r.reservationId} value={r.reservationId}>
                      {r.reservationCode} — {r.customerName} (
                      {r.assignedUnitCode || r.unitTypeName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!handover ? (
              <div className="mt-4 rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
                Hiện không có phiếu đặt giữ chỗ nào chờ bàn giao tại cơ sở này.
              </div>
            ) : (
              <>
                <div className="mt-2 text-[15px] font-bold">Kho #{handover.unit}</div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[12px] font-bold">
                      {handover.customer}
                      <span className="material-symbols-outlined text-[13px] text-[#1d5fe5]">
                        verified
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8996a9]">{handover.phone}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-[#3a475a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8996a9]">Loại khoang</span>
                    <span className="font-semibold">{handover.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8996a9]">Tiền cọc</span>
                    <span className="font-semibold">{handover.deposit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8996a9]">Tổng báo giá</span>
                    <span className="font-semibold">{handover.quotedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8996a9]">Thời hạn thuê</span>
                    <span className="font-semibold">
                      {handover.startDate} → {handover.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8996a9]">Trạng thái phiếu</span>
                    <span className="font-bold uppercase text-[#1d5fe5]">
                      {handover.status}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 1: Quản lý Danh sách công việc hàng ngày (Daily Staff Tasks - Flow 5) */}
        <div
          id="daily-staff-tasks-section"
          className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-bold">
                  Danh sách công việc hàng ngày trong ca trực (Daily Staff Tasks)
                </div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                  {taskProgress.completed}/{taskProgress.total} Hoàn tất
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-[#8996a9]">
                Lịch check-in nhận kho, kiểm tra trả kho, ticket cần xử lý và nhiệm vụ vệ sinh/bảo trì tại cơ sở phân công
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap rounded-[8px] bg-[#eef4ff] p-0.5">
                {scheduleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveScheduleTab(tab.id)}
                    className={`flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 text-[10px] font-semibold transition ${
                      activeScheduleTab === tab.id ? "bg-[#0b1c30] text-white" : "text-[#58657a]"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fetchStaffTasks(selectedFacilityId)}
                disabled={tasksLoading}
                className="flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[10px] font-semibold text-[#3a475a] hover:bg-[#eef4ff]"
              >
                <span className="material-symbols-outlined text-[13px]">refresh</span>
                Làm mới
              </button>
            </div>
          </div>

          {tasksError && (
            <div className="mt-3 rounded-[10px] border border-[#fecdca] bg-[#fff1f1] px-3 py-2 text-[11px] font-semibold text-[#b3261e]">
              {tasksError}
            </div>
          )}

          {taskActionFeedback && (
            <div className="mt-3 rounded-[10px] border border-[#abefc6] bg-[#ecfdf3] px-3 py-2 text-[11px] font-semibold text-[#067647]">
              {taskActionFeedback}
            </div>
          )}

          <div className="mt-3 space-y-2.5">
            {tasksLoading ? (
              <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-6 text-center text-[11px] text-[#58657a]">
                Đang tải danh sách nhiệm vụ trong ca trực...
              </div>
            ) : filteredSchedule.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
                Không có nhiệm vụ nào trong mục này.
              </div>
            ) : (
              filteredSchedule.map((task) => {
                const isUpdating = Number(updatingTaskId) === Number(task.id);
                const statusKey = task.statusMeta?.key || "todo";

                return (
                  <div
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3.5 transition hover:border-[#c7d1e6]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                        <span className="material-symbols-outlined text-[18px]">
                          {task.typeMeta?.icon || "task"}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#0b1c30]">
                            {task.title}
                          </span>
                          <span className="text-[10px] font-semibold text-[#1d5fe5]">
                            #TASK-{task.id}
                          </span>
                          {task.typeMeta && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${task.typeMeta.badgeClass}`}
                            >
                              {task.typeMeta.label}
                            </span>
                          )}
                          {task.statusMeta && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${task.statusMeta.badgeClass}`}
                            >
                              {task.statusMeta.displayLabel} • {task.statusMeta.viLabel}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8996a9]">
                          <span>Cơ sở: {task.facilityCode || `#${task.facilityId}`}</span>
                          <span>
                            • Phụ trách: {task.assignedEmployeeName || "Nhân viên ca trực"}
                          </span>
                          <span>• Hạn: {task.dueFormatted}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-36 overflow-hidden rounded-full bg-[#dfe7f5]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                statusKey === "done"
                                  ? "bg-[#0e7b4c]"
                                  : statusKey === "blocked"
                                  ? "bg-[#c0362c]"
                                  : "bg-[#1d5fe5]"
                              }`}
                              style={{ width: `${task.progressPercent ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#3a475a]">
                            {task.progressPercent ?? 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: PUT /api/staff/tasks/{id}/status (In Progress, Completed, Blocked) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isUpdating || statusKey === "in_progress"}
                        onClick={() => handleUpdateTaskStatus(task.id, "in_progress", 50)}
                        className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold transition ${
                          statusKey === "in_progress"
                            ? "bg-[#1d5fe5] text-white opacity-90"
                            : "border border-[#1d5fe5] bg-white text-[#1d5fe5] hover:bg-[#eef4ff]"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                        In Progress
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || statusKey === "done"}
                        onClick={() => handleUpdateTaskStatus(task.id, "completed", 100)}
                        className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold transition ${
                          statusKey === "done"
                            ? "bg-[#0e7b4c] text-white opacity-90"
                            : "border border-[#0e7b4c] bg-white text-[#0e7b4c] hover:bg-[#e7f8ee]"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Completed
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || statusKey === "blocked"}
                        onClick={() =>
                          handleUpdateTaskStatus(
                            task.id,
                            "blocked",
                            statusKey === "done" ? 50 : task.progressPercent || 0
                          )
                        }
                        className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold transition ${
                          statusKey === "blocked"
                            ? "bg-[#c0362c] text-white opacity-90"
                            : "border border-[#c0362c]/50 bg-white text-[#c0362c] hover:bg-[#fdecec]"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <span className="material-symbols-outlined text-[13px]">block</span>
                        Blocked
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffDashboard;

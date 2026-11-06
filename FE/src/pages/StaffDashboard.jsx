import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import StaffReservationLookup from "../components/StaffReservationLookup";
import StaffMoveOutTab from "../components/StaffMoveOutTab";
import StaffFacilityUnits from "../components/StaffFacilityUnits";
import StaffTaskStatus from "../components/StaffTaskStatus";
import StaffShiftSchedule from "../components/StaffShiftSchedule";
import StaffAssignedTicketModal from "../components/StaffAssignedTicketModal";
import { hasCapability, CAPABILITIES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";
import staffFacilityService from "../api/staffFacilityService";
import staffReservationService from "../api/staffReservationService";
import staffSupportService from "../api/staffSupportService";
import staffTaskService from "../api/staffTaskService";
import facilityService from "../api/facilityService";
import { STORAGE_UNIT_STATUS, RESERVATION_STATUS } from "../constants/rentalConstants";
import { TICKET_STATUS } from "../constants/ticketConstants";
import { useSignalR } from "../context/SignalRContext";
import { useLanguage } from "../context/LanguageContext";

export default function StaffDashboard({ initialTab = "checkin" }) {
  const { user } = useAuth();
  const { t, translateStatus } = useLanguage();
  const { subscribe, joinFacility, recentEvent } = useSignalR();

  const storageKey = user?.id ? `staff_selected_facility_id_${user.id}` : "staff_selected_facility_id";

  // Cơ sở vận hành đang chọn — được xác định từ API /staff/my-facility (phân công thật của nhân viên),
  // chỉ dùng giá trị lưu ở localStorage nếu đã từng được xác định trước đó trong phiên này.
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    () => localStorage.getItem(storageKey) || null
  );
  const [myFacilityInfo, setMyFacilityInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab === "overdue" ? "checkin" : initialTab); // 'checkin' | 'moveout' | 'units' | 'shifts' | 'issues'

  // Dynamic Metrics State
  const [facilities, setFacilities] = useState([]);
  const [units, setUnits] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Sub-tabs & selected ticket for assigned tickets modal
  const [ticketSubTab, setTicketSubTab] = useState("active"); // 'active' | 'completed'
  const [selectedStaffTicket, setSelectedStaffTicket] = useState(null);

  // Active task type and status filter inside Issues tab
  const [activeTaskType, setActiveTaskType] = useState("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState("active"); // 'active' | 'done' | 'all' 

  const requestId = useRef(0);

  // Fetch all real-time operational data from backend
  const loadDashboardData = async (facilityId = selectedFacilityId) => {
    const currentRequest = ++requestId.current;
    setLoadingMetrics(true);

    try {
      const [unitsRes, rsvRes, tasksRes, ticketsRes, facilitiesRes] = await Promise.allSettled([
        staffFacilityService.getUnits(Number(facilityId)),
        staffReservationService.lookup("", facilityId),
        staffTaskService.getTasks(facilityId),
        staffSupportService.getTickets({ facilityId: Number(facilityId) }),
        facilityService.getFacilities(),
      ]);

      if (currentRequest !== requestId.current) return;

      if (unitsRes.status === "fulfilled") setUnits(unitsRes.value || []);
      if (rsvRes.status === "fulfilled") setReservations(rsvRes.value || []);
      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value || []);
      if (ticketsRes.status === "fulfilled") setSupportTickets(ticketsRes.value || []);
      if (facilitiesRes.status === "fulfilled") setFacilities(facilitiesRes.value || []);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingMetrics(false);
      }
    }
  };

  // Xác định cơ sở nhân viên thực sự được phân công và đồng bộ cache theo user
  useEffect(() => {
    let cancelled = false;
    staffFacilityService
      .getMyFacility()
      .then((info) => {
        if (cancelled || !info?.facilityId) return;
        setMyFacilityInfo(info);
        const assignedId = String(info.facilityId);
        setSelectedFacilityId((current) => {
          if (current !== assignedId) {
            localStorage.setItem(storageKey, assignedId);
            return assignedId;
          }
          return current;
        });
      })
      .catch((err) => {
        console.error("Failed to resolve staff's assigned facility:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, storageKey]);

  useEffect(() => {
    if (!selectedFacilityId) return;
    loadDashboardData(selectedFacilityId);
    return () => {
      requestId.current++;
    };
  }, [selectedFacilityId]);

  // Real-time synchronization via SignalR
  useEffect(() => {
    if (!recentEvent) return;
    const t = recentEvent.type;
    if (t === "ticket" || t === "task" || t === "notification" || t === "unit") {
      loadDashboardData(selectedFacilityId);
    }
  }, [recentEvent, selectedFacilityId]);

  useEffect(() => {
    const unsubTicket = subscribe("TicketUpdated", () => {
      loadDashboardData(selectedFacilityId);
    });
    const unsubTask = subscribe("TaskAssigned", () => {
      loadDashboardData(selectedFacilityId);
    });
    return () => {
      unsubTicket();
      unsubTask();
    };
  }, [subscribe, selectedFacilityId]);

  // Derived real KPI statistics
  const totalUnits = units.length;
  const vacantUnits = units.filter(
    (u) => u.status === STORAGE_UNIT_STATUS.AVAILABLE || u.status === "vacant"
  ).length;
  const occupiedUnits = units.filter(
    (u) => u.status === STORAGE_UNIT_STATUS.OCCUPIED || u.status === "rented"
  ).length;
  const pendingUnits = units.filter(
    (u) => u.status === STORAGE_UNIT_STATUS.RESERVED || u.status === "pending"
  ).length;
  const cleaningUnits = units.filter(
    (u) => u.status === STORAGE_UNIT_STATUS.CLEANING || u.status === "cleaning"
  ).length;
  const maintenanceUnits = units.filter(
    (u) => u.status === STORAGE_UNIT_STATUS.MAINTENANCE || u.status === "under_maintenance"
  ).length;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "done"
  ).length;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);

  const confirmedReservations = reservations.filter(
    (r) => r.status === RESERVATION_STATUS.CONFIRMED || r.status === RESERVATION_STATUS.PENDING
  ).length;

  // Bộ lọc: chỉ hiển thị Ticket do Manager phân công cho Staff đang đăng nhập
  const myAssignedTickets = useMemo(() => {
    const uid = user?.id || user?.userId || user?.employeeId;
    const staffName = (user?.fullName || user?.name || "").trim().toLowerCase();
    return supportTickets.filter((t) => {
      if (t.isAssignedToMe) return true;
      if (uid && (t.assignedEmployeeId === uid || t.assignedToId === uid || String(t.assignedEmployeeId) === String(uid))) return true;
      if (user?.employeeId && (t.assignedEmployeeId === user.employeeId || String(t.assignedEmployeeId) === String(user.employeeId))) return true;
      if (staffName && t.assignedEmployeeName && t.assignedEmployeeName.trim().toLowerCase() === staffName) return true;
      if (!t.assignedEmployeeId) return true; // Newly created tickets for facility can be picked up and handled by staff
      return false;
    });
  }, [supportTickets, user]);

  const activeTickets = useMemo(() => {
    return myAssignedTickets.filter((t) =>
      t.status !== "resolved" && t.status !== "closed" && t.status !== "completed"
    );
  }, [myAssignedTickets]);

  const completedTickets = useMemo(() => {
    return myAssignedTickets.filter((t) =>
      t.status === "resolved" || t.status === "closed" || t.status === "completed"
    );
  }, [myAssignedTickets]);

  const openTickets = activeTickets;
  const openIssuesCount = pendingTasks + activeTickets.length;

  const staffFacility = useMemo(() => {
    if (myFacilityInfo?.facilityId) {
      return {
        id: myFacilityInfo.facilityId,
        facilityCode: myFacilityInfo.facilityCode,
        facilityName: myFacilityInfo.facilityName,
        address: myFacilityInfo.address || myFacilityInfo.city || "",
      };
    }
    const fId = tasks[0]?.facilityId || user?.facilityId || selectedFacilityId || 1;
    return (
      facilities.find((f) => String(f.id) === String(fId)) || {
        id: fId,
        facilityCode: `FAC-${fId}`,
        facilityName: `Facility #${fId}`,
        address: "Ho Chi Minh City",
      }
    );
  }, [myFacilityInfo, facilities, tasks, user, selectedFacilityId]);

  // Task categories filter
  const taskTabs = useMemo(() => [
    { id: "all", label: "All Tasks", count: tasks.length },
    ...[...new Set(tasks.map((task) => task.taskType).filter(Boolean))].map((type) => ({
      id: type,
      label: type.replaceAll("_", " "),
      count: tasks.filter((task) => task.taskType === type).length,
    })),
  ], [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeTaskType !== "all" && task.taskType !== activeTaskType) return false;
      const isDone = task.status === "done" || task.status === "completed";
      if (taskStatusFilter === "active" && isDone) return false;
      if (taskStatusFilter === "done" && !isDone) return false;
      return true;
    });
  }, [tasks, activeTaskType, taskStatusFilter]);

  const handleUpdateTask = (updated) => {
    setTasks((current) =>
      current.map((task) => (task.id === updated.id ? updated : task))
    );
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950 dark:text-zinc-100 text-slate-900 font-sans flex flex-col antialiased">
      <PageBackground />

      {/* Shared Portal Header without Customer Links */}
      <Header active="ops" hideCustomerNav={true} />

      {/* Main Operations Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">

        {/* 4 Informational KPI Stat Cards (Strictly Non-Clickable) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {/* KPI 1: Check-in Queue (Click to switch to Check-in / Scan QR) */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("checkin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("staff.checkin_handover", "Check-in & Bàn giao")}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {t("staff.checkin_handover", "Check-in & Bàn giao")}
                </p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-zinc-900 dark:text-zinc-100 border border-blue-200 group-hover:bg-zinc-900 text-white group-hover:text-white transition-colors">
                  {t("common.scan_qr", "Quét QR")}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : String(confirmedReservations).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-blue-600">{translateStatus("pending")}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-zinc-900 text-white text-zinc-900 dark:text-zinc-100 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          </button>

          {/* KPI 2: Shift Tasks */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">{t("staff.tasks", "Nhiệm vụ")}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {loadingMetrics ? "..." : String(completedTasks).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ {totalTasks}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>

          {/* KPI 3: Assigned Tickets */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("issues");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("staff.assigned_tickets", "Việc phân công")}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                {t("staff.assigned_tickets", "Việc phân công")}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-blue-600 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : String(activeTickets.length).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {completedTickets.length} {t("common.done", "đã xong")}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-zinc-900 text-white text-zinc-900 dark:text-zinc-100 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </button>

          {/* KPI 4: Occupancy */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">{t("manager.occupancy_rate", "Tỷ lệ lấp đầy")}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {loadingMetrics ? "..." : `${occupancyRate}%`}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {vacantUnits} {t("status.available", "trống")}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Center Grid: balanced workspace columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Main Navigation Tabs & Operational Modules */}
          <div className="lg:col-span-6 space-y-5">

            {/* Main Tabs Container */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("checkin")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "checkin"
                      ? "bg-zinc-900 text-white text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t("staff.checkin_tab", "Check-in")}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("moveout")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "moveout"
                      ? "bg-zinc-900 text-white text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t("staff.moveout_tab", "Trả kho")}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("units")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "units"
                      ? "bg-zinc-900 text-white text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t("staff.units_tab", "Ô kho")}
                </button>

                {hasCapability(user, CAPABILITIES.SHIFT_VIEW) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("shifts")}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "shifts"
                        ? "bg-zinc-900 text-white text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t("staff.shifts_tab", "Ca trực")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("issues")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "issues"
                      ? "bg-zinc-900 text-white text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t("staff.issues_tab", "Sự cố")} ({openIssuesCount})
                </button>
              </div>

              {/* Dynamic Module Based on Active Tab */}
              <div className="pt-2 border-t border-slate-100">
                {activeTab === "checkin" && (
                  <StaffReservationLookup />
                )}

                {activeTab === "moveout" && (
                  <StaffMoveOutTab facilityId={selectedFacilityId} />
                )}

                {activeTab === "units" && (
                  <StaffFacilityUnits initialFacilityId={selectedFacilityId} />
                )}

                {activeTab === "shifts" && (
                  <StaffShiftSchedule facilityId={selectedFacilityId} />
                )}

                {activeTab === "issues" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase">{t("staff.tasks", "Nhiệm vụ")}</h3>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setTaskStatusFilter("active")}
                            className={`px-2.5 py-1 rounded transition cursor-pointer ${
                              taskStatusFilter === "active"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Cần làm ({pendingTasks})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskStatusFilter("done")}
                            className={`px-2.5 py-1 rounded transition cursor-pointer ${
                              taskStatusFilter === "done"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Đã xong ({completedTasks})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskStatusFilter("all")}
                            className={`px-2.5 py-1 rounded transition cursor-pointer ${
                              taskStatusFilter === "all"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Tất cả ({totalTasks})
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {taskTabs.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTaskType(t.id)}
                            className={`px-2 py-0.5 text-[11px] rounded font-semibold capitalize transition cursor-pointer ${
                              activeTaskType === t.id
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {t.label} ({t.count})
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        {t("common.no_data", "Không có dữ liệu")}
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="text-xs font-bold text-slate-900">
                                {task.title || `Task #${task.id}`}
                              </strong>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {task.facilityCode || "HCM-TD"} • {task.status === "done" ? "done (đã xong)" : task.status}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {task.progressPercent ?? 0}%
                            </span>
                          </div>
                          <div>
                            <StaffTaskStatus task={task} onUpdated={handleUpdateTask} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Support Tickets Live Feed */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-zinc-900 dark:text-zinc-100">
                    assignment_late
                  </span>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t("staff.assigned_tickets", "Tickets phân công")}
                  </h2>
                </div>

                {/* Sub-tabs: Việc cần làm vs Đã hoàn thành */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTicketSubTab("active")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      ticketSubTab === "active"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t("staff.todo_tickets", "Cần làm")} ({activeTickets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketSubTab("completed")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      ticketSubTab === "completed"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t("common.done", "Đã xong")} ({completedTickets.length})
                  </button>
                </div>
              </div>

              {/* Ticket List */}
              {ticketSubTab === "active" ? (
                activeTickets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    {t("staff.no_pending_tickets", "Hiện không có ticket nào cần xử lý.")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedStaffTicket(ticket)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0 border border-amber-200">
                                {ticket.ticketNo || `#${ticket.id}`}
                              </span>
                              {ticket.unitCode && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0 border border-blue-200">
                                  {t("common.unit", "Kho")} {ticket.unitCode}
                                </span>
                              )}
                              {ticket.priority === "urgent" && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                                  {t("tickets.urgent", "Khẩn cấp")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-700 transition">
                              {ticket.subject || ticket.description || t("tickets.issue_job", "Công việc sự cố kho")}
                            </p>
                            {ticket.customerName && (
                              <p className="text-[11px] text-slate-500">
                                {t("common.customer", "Khách hàng")}: {ticket.customerName}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffTicket(ticket);
                            }}
                            className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
                          >
                            {t("staff.handle_action", "Xử lý →")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                completedTickets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    {t("staff.no_completed_tickets", "Chưa có công việc nào được hoàn thành gần đây.")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedStaffTicket(ticket)}
                        className="p-3 rounded-xl border border-slate-100 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
                                {ticket.ticketNo || `#${ticket.id}`}
                              </span>
                              {ticket.unitCode && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                                  {t("common.unit", "Kho")} {ticket.unitCode}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-emerald-700">
                                ✓ {t("common.done", "Đã xong")}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {ticket.subject || ticket.description || "Support"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffTicket(ticket);
                            }}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
                          >
                            {t("common.view", "Xem lại")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Staff Assigned Ticket Modal */}
            <StaffAssignedTicketModal
              ticket={selectedStaffTicket}
              isOpen={Boolean(selectedStaffTicket)}
              onClose={() => setSelectedStaffTicket(null)}
              onSuccess={() => {
                loadDashboardData(selectedFacilityId);
              }}
            />

          </div>

          {/* Right Column: Smart Floorplan & Staff Duty Facility Presence */}
          <div className="lg:col-span-6 space-y-5">

            {/* Smart Floorplan Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t("manager.units", "Mặt bằng & Ô kho")}</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("units")}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
                >
                  {t("common.view", "Mở rộng")}
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-slate-100 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80"
                  alt="Floorplan"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {staffFacility?.facilityCode || "HCM-TD"}
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : vacantUnits}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-medium">{t("status.available", "Trống")}</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : occupiedUnits}
                  </span>
                  <span className="block text-[10px] text-blue-700 font-medium">{t("status.occupied", "Đang thuê")}</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : pendingUnits}
                  </span>
                  <span className="block text-[10px] text-amber-700 font-medium">{t("status.reserved", "Giữ chỗ")}</span>
                </div>
                <div className="bg-purple-50 border border-purple-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : cleaningUnits}
                  </span>
                  <span className="block text-[10px] text-purple-700 font-medium">{t("status.cleaning", "Vệ sinh")}</span>
                </div>
                <div className="bg-red-50 border border-red-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : maintenanceUnits}
                  </span>
                  <span className="block text-[10px] text-red-700 font-medium">{t("status.maintenance", "Bảo trì")}</span>
                </div>
              </div>
            </div>

            {/* Staff Assigned Facility Presence Card */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs h-32 bg-slate-900">
              <img
                src={
                  staffFacility?.imageUrl ||
                  staffFacility?.photoUrl ||
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                }
                alt={staffFacility?.facilityName || "Facility"}
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
                <div>
                  <p className="text-xs font-bold text-white">
                    {staffFacility?.facilityName || "Facility Hub"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {staffFacility?.facilityCode || "HCM-TD"} • {totalUnits} units
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Online
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Shared Portal Footer */}
      <Footer />
    </div>
  );
}

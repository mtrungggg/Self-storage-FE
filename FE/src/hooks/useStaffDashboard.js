import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getNavTabs,
  getLegend,
  getScheduleTabs,
  getTaskTypeMeta,
  getTaskStatusMeta,
} from "../data/staffDashboardRepository";
import { filterFacilityUnits } from "../domain/usecases/filterFacilityUnits";
import { countUnitsByStatus } from "../domain/usecases/countUnitsByStatus";
import { filterScheduleByType } from "../domain/usecases/filterScheduleByType";
import { calculateTaskProgress } from "../domain/usecases/calculateTaskProgress";
import staffService from "../api/staffService";
import facilityService from "../api/facilityService";
import useAuth from "./useAuth";

function formatTaskTime(isoString) {
  if (!isoString) return "Trong ca trực";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatVnd(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "0 đ";
  return `${num.toLocaleString("vi-VN")} đ`;
}

function mapUnitStatus(rawStatus) {
  const s = (rawStatus || "").toLowerCase();
  if (s === "available" || s === "vacant") return "available";
  if (s === "occupied" || s === "rented" || s === "active") return "occupied";
  if (s === "reserved" || s === "handover" || s === "pending") return "handover";
  return "alert";
}

function extractZoneFromCode(unitCode) {
  if (!unitCode) return "Khác";
  const match = String(unitCode).trim().match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : "Khác";
}

// Application layer: encapsulates Staff Dashboard state, filtering and real API wiring (no hardcoded data).
export function useStaffDashboard() {
  const { user } = useAuth();
  const legend = useMemo(() => getLegend(), []);

  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);

  const [rawUnits, setRawUnits] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [moveOuts, setMoveOuts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [facilityLoading, setFacilityLoading] = useState(true);

  const [activeNavTab, setActiveNavTab] = useState("map");
  const [activeZone, setActiveZone] = useState("all");
  const [activeScheduleTab, setActiveScheduleTab] = useState("all");
  const [now, setNow] = useState(() => new Date());

  // Daily Staff Tasks state (GET /api/staff/tasks & PUT /api/staff/tasks/{id}/status)
  const [staffTasks, setStaffTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [taskActionFeedback, setTaskActionFeedback] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load facilities first
  useEffect(() => {
    let mounted = true;
    async function loadFacilities() {
      try {
        const list = await facilityService.getFacilities();
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : [];
        setFacilities(arr);
        if (arr.length > 0) {
          setSelectedFacilityId((prev) => prev ?? arr[0].id);
        }
      } catch {
        // Ignore facility list error if public endpoint fails
      }
    }
    loadFacilities();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchStaffTasks = useCallback(
    async (facilityIdOverride) => {
      const targetFacilityId =
        facilityIdOverride !== undefined ? facilityIdOverride : selectedFacilityId;
      setTasksLoading(true);
      setTasksError("");
      try {
        const data = await staffService.getStaffTasks(
          targetFacilityId ? { facilityId: targetFacilityId } : {}
        );
        const list = Array.isArray(data) ? data : [];
        setStaffTasks(list);
        if (!selectedFacilityId && list.length > 0 && list[0].facilityId) {
          setSelectedFacilityId(list[0].facilityId);
        }
      } catch (err) {
        setTasksError(err?.message || "Không thể tải danh sách công việc trong ca trực.");
      } finally {
        setTasksLoading(false);
      }
    },
    [selectedFacilityId]
  );

  const fetchFacilityOperations = useCallback(async (facilityId) => {
    setFacilityLoading(true);
    try {
      const params = facilityId ? { facilityId } : {};
      const [unitsRes, resLookup, moveOutsRes, ticketsRes] = await Promise.allSettled([
        facilityId ? staffService.getFacilityUnits(facilityId) : Promise.resolve([]),
        staffService.lookupReservations(params),
        staffService.getMoveOuts(params),
        staffService.getSupportTickets(params),
      ]);

      const nextUnits =
        unitsRes.status === "fulfilled" && Array.isArray(unitsRes.value)
          ? unitsRes.value
          : [];
      const nextReservations =
        resLookup.status === "fulfilled" && Array.isArray(resLookup.value)
          ? resLookup.value
          : [];
      const nextMoveOuts =
        moveOutsRes.status === "fulfilled" && Array.isArray(moveOutsRes.value)
          ? moveOutsRes.value
          : [];
      const nextTickets =
        ticketsRes.status === "fulfilled" && Array.isArray(ticketsRes.value)
          ? ticketsRes.value
          : [];

      setRawUnits(nextUnits);
      setReservations(nextReservations);
      setSelectedReservationId((prev) => {
        if (prev && nextReservations.some((r) => r.reservationId === prev)) return prev;
        return nextReservations[0]?.reservationId ?? null;
      });
      setMoveOuts(nextMoveOuts);
      setSupportTickets(nextTickets);
    } finally {
      setFacilityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffTasks(selectedFacilityId);
    fetchFacilityOperations(selectedFacilityId);
  }, [selectedFacilityId, fetchStaffTasks, fetchFacilityOperations]);

  const currentFacility = useMemo(
    () => facilities.find((f) => Number(f.id) === Number(selectedFacilityId)) || null,
    [facilities, selectedFacilityId]
  );

  // Derived staff profile from authenticated user & selected facility
  const profile = useMemo(() => {
    const roleMap = {
      admin: "Quản trị viên",
      manager: "Quản lý cơ sở",
      staff: "Nhân viên vận hành",
    };
    const roleKey = (user?.role || "").toLowerCase();
    return {
      name: user?.fullName || user?.email || "Nhân viên ca trực",
      code: user?.id ? `#NV-${user.id}` : user?.email || "",
      role: roleMap[roleKey] || user?.role || "Nhân viên",
      facility:
        currentFacility?.name ||
        (selectedFacilityId ? `Cơ sở #${selectedFacilityId}` : "Toàn hệ thống"),
    };
  }, [user, currentFacility, selectedFacilityId]);

  // Map raw API units into UI unit cards
  const units = useMemo(() => {
    return rawUnits.map((u) => {
      const code = u.unitCode || `UNIT-${u.unitId}`;
      const status = mapUnitStatus(u.status);
      const zone = extractZoneFromCode(code);
      let note = formatVnd(u.currentRate);
      if (u.customerName) {
        note = u.customerName;
      } else if (u.currentAgreementNo) {
        note = u.currentAgreementNo;
      }
      return {
        id: code,
        unitId: u.unitId,
        zone,
        size: u.unitTypeName || "Tiêu chuẩn",
        status,
        rawStatus: u.status,
        note,
        currentAgreementNo: u.currentAgreementNo,
        customerName: u.customerName,
      };
    });
  }, [rawUnits]);

  // Dynamic zones derived from actual facility units
  const zones = useMemo(() => {
    const distinctZones = Array.from(new Set(units.map((u) => u.zone))).sort();
    return [
      { id: "all", label: "Tất cả" },
      ...distinctZones.map((z) => ({ id: z, label: `Khu ${z}` })),
    ];
  }, [units]);

  const enrichedTasks = useMemo(() => {
    return staffTasks.map((t) => {
      const typeMeta = getTaskTypeMeta(t.taskType);
      const statusMeta = getTaskStatusMeta(t.status);
      const progress =
        statusMeta.key === "done"
          ? 100
          : typeof t.progressPercent === "number"
          ? t.progressPercent
          : 0;
      return {
        ...t,
        typeMeta,
        statusMeta,
        progressPercent: progress,
        dueFormatted: formatTaskTime(t.dueAt || t.createdAt),
      };
    });
  }, [staffTasks]);

  const taskProgress = useMemo(
    () => calculateTaskProgress(enrichedTasks),
    [enrichedTasks]
  );

  const openTicketCount = useMemo(
    () =>
      supportTickets.filter(
        (t) => !["closed", "resolved"].includes((t.status || "").toLowerCase())
      ).length,
    [supportTickets]
  );

  const navTabs = useMemo(() => {
    const pendingTaskCount = enrichedTasks.filter(
      (t) => t.statusMeta.key !== "done"
    ).length;
    return getNavTabs({ pendingTaskCount, openTicketCount });
  }, [enrichedTasks, openTicketCount]);

  // Dynamic KPIs calculated from real units, reservations, move-outs, and support tickets/tasks
  const kpis = useMemo(() => {
    const totalUnits = units.length;
    const occupiedCount = units.filter((u) => u.status === "occupied").length;
    const occupancyRate =
      totalUnits > 0 ? ((occupiedCount / totalUnits) * 100).toFixed(1) : "0.0";

    const pendingReservationsCount = reservations.length;
    const checkInTaskCount = enrichedTasks.filter(
      (t) => t.typeMeta?.category === "checkin" && t.statusMeta?.key !== "done"
    ).length;

    const totalMoveOuts = moveOuts.length;
    const pendingMoveOuts = moveOuts.filter(
      (m) => (m.status || "").toLowerCase() !== "completed"
    ).length;

    const maintenanceTasks = enrichedTasks.filter(
      (t) => t.typeMeta?.category === "maintenance" && t.statusMeta?.key !== "done"
    ).length;

    return [
      {
        id: "total",
        icon: "warehouse",
        label: "Tổng kho cơ sở",
        value: String(totalUnits),
        sub: `${occupiedCount} đang thuê • ${occupancyRate}% lấp đầy`,
      },
      {
        id: "pending",
        icon: "vpn_key",
        label: "Phiếu chờ bàn giao",
        value: String(pendingReservationsCount),
        sub: `${checkInTaskCount} nhiệm vụ check-in trong ca`,
      },
      {
        id: "return",
        icon: "assignment_return",
        label: "Trả & kiểm kho",
        value: String(totalMoveOuts),
        sub: `${pendingMoveOuts} chờ đối chiếu • ${totalMoveOuts - pendingMoveOuts} đã xong`,
      },
      {
        id: "support",
        icon: "support_agent",
        label: "Ticket & Bảo trì",
        value: String(openTicketCount + maintenanceTasks),
        sub: `${openTicketCount} ticket mở • ${maintenanceTasks} bảo trì`,
      },
    ];
  }, [units, reservations, enrichedTasks, moveOuts, openTicketCount]);

  const scheduleTabs = useMemo(
    () => getScheduleTabs(enrichedTasks),
    [enrichedTasks]
  );

  const filteredSchedule = useMemo(
    () => filterScheduleByType(enrichedTasks, activeScheduleTab),
    [enrichedTasks, activeScheduleTab]
  );

  const filteredUnits = useMemo(
    () => filterFacilityUnits(units, activeZone, null),
    [units, activeZone]
  );

  const legendWithCounts = useMemo(
    () =>
      legend.map((item) => ({
        ...item,
        count: countUnitsByStatus(units, item.id),
      })),
    [units, legend]
  );

  const selectedReservation = useMemo(() => {
    if (reservations.length === 0) return null;
    return (
      reservations.find((r) => r.reservationId === selectedReservationId) ||
      reservations[0]
    );
  }, [reservations, selectedReservationId]);

  const handover = useMemo(() => {
    if (!selectedReservation) return null;
    return {
      reservationId: selectedReservation.reservationId,
      unit:
        selectedReservation.assignedUnitCode ||
        selectedReservation.unitTypeName ||
        "Chưa gán khoang",
      code: selectedReservation.reservationCode || `#RES-${selectedReservation.reservationId}`,
      customer: selectedReservation.customerName || `Khách hàng #${selectedReservation.customerId}`,
      phone: selectedReservation.customerPhone || "Chưa cập nhật SĐT",
      size: selectedReservation.unitTypeName || "Tiêu chuẩn",
      deposit: formatVnd(selectedReservation.depositSnapshot),
      quotedTotal: formatVnd(selectedReservation.quotedTotal),
      status: selectedReservation.status,
      startDate: selectedReservation.startDate,
      endDate: selectedReservation.endDate,
    };
  }, [selectedReservation]);

  // Update task progress/status (PUT /api/staff/tasks/{id}/status)
  const handleUpdateTaskStatus = useCallback(
    async (taskId, newStatus, progressPercent) => {
      if (!taskId) return;
      setUpdatingTaskId(taskId);
      setTasksError("");
      setTaskActionFeedback("");
      try {
        const updated = await staffService.updateTaskStatus(taskId, {
          status: newStatus,
          progressPercent,
        });
        if (updated) {
          setStaffTasks((prev) =>
            prev.map((item) => (Number(item.id) === Number(taskId) ? updated : item))
          );
        } else {
          await fetchStaffTasks();
        }
        const statusMeta = getTaskStatusMeta(newStatus);
        setTaskActionFeedback(
          `Đã cập nhật nhiệm vụ #${taskId} sang trạng thái "${statusMeta.displayLabel}" (${statusMeta.viLabel}).`
        );
      } catch (err) {
        setTasksError(err?.message || "Cập nhật tiến độ nhiệm vụ thất bại.");
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [fetchStaffTasks]
  );

  return {
    profile,
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    facilityLoading,
    navTabs,
    activeNavTab,
    setActiveNavTab,
    currentTime: now.toLocaleTimeString("vi-VN", { hour12: false }),
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

    // Daily Staff Tasks
    staffTasks: enrichedTasks,
    tasksLoading,
    tasksError,
    taskProgress,
    updatingTaskId,
    taskActionFeedback,
    fetchStaffTasks,
    handleUpdateTaskStatus,
  };
}

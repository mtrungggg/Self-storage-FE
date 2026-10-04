import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStaffProfile,
  getNavTabs,
  getKpis,
  getZones,
  getFloors,
  getUnits,
  getLegend,
  getHandover,
  getScheduleTabs,
  getTaskTypeMeta,
  getTaskStatusMeta,
} from "../data/staffDashboardRepository";
import { filterFacilityUnits } from "../domain/usecases/filterFacilityUnits";
import { countUnitsByStatus } from "../domain/usecases/countUnitsByStatus";
import { filterScheduleByType } from "../domain/usecases/filterScheduleByType";
import { calculateTaskProgress } from "../domain/usecases/calculateTaskProgress";
import staffService from "../api/staffService";

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

// Application layer: encapsulates Staff Dashboard state, filtering and API wiring.
export function useStaffDashboard() {
  const profile = getStaffProfile();
  const baseKpis = getKpis();
  const zones = getZones();
  const floors = getFloors();
  const units = getUnits();
  const legend = getLegend();
  const handover = getHandover();

  const [activeNavTab, setActiveNavTab] = useState("map");
  const [activeZone, setActiveZone] = useState("all");
  const [activeFloor, setActiveFloor] = useState("floor1");
  const [activeScheduleTab, setActiveScheduleTab] = useState("all");
  const [checkedItems, setCheckedItems] = useState(
    () => new Set(handover.checklist.map((item) => item.id))
  );
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

  const fetchStaffTasks = useCallback(async (facilityId) => {
    setTasksLoading(true);
    setTasksError("");
    try {
      const data = await staffService.getStaffTasks(facilityId ? { facilityId } : {});
      setStaffTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setTasksError(err?.message || "Không thể tải danh sách công việc trong ca trực.");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffTasks();
  }, [fetchStaffTasks]);

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

  const navTabs = useMemo(() => {
    const pendingCount = enrichedTasks.filter((t) => t.statusMeta.key !== "done").length;
    return getNavTabs(pendingCount);
  }, [enrichedTasks]);

  const scheduleTabs = useMemo(
    () => getScheduleTabs(enrichedTasks),
    [enrichedTasks]
  );

  const filteredSchedule = useMemo(
    () => filterScheduleByType(enrichedTasks, activeScheduleTab),
    [enrichedTasks, activeScheduleTab]
  );

  const filteredUnits = useMemo(
    () => filterFacilityUnits(units, activeZone, activeFloor),
    [units, activeZone, activeFloor]
  );

  const legendWithCounts = useMemo(
    () => legend.map((item) => ({ ...item, count: countUnitsByStatus(units, item.id) })),
    [units, legend]
  );

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

  const toggleChecklistItem = (id) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return {
    profile,
    navTabs,
    activeNavTab,
    setActiveNavTab,
    currentTime: now.toLocaleTimeString("vi-VN", { hour12: false }),
    kpis: baseKpis,
    zones,
    activeZone,
    setActiveZone,
    floors,
    activeFloor,
    setActiveFloor,
    filteredUnits,
    legendWithCounts,
    handover,
    checkedItems,
    toggleChecklistItem,
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

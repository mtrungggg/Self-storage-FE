import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStatusBanner,
  getOverviewHeader,
  getWeekRangeLabel,
  getHeaderActions,
  getKpis,
  getWeekDays,
  getDepartments,
  getShiftLegend,
  getAttendanceLegend,
  getHandoverTag,
  getHandoverChecklist,
  getHandoverNote,
} from "../data/staffSchedulingRepository";
import { getTaskTypeMeta, getTaskStatusMeta } from "../data/staffDashboardRepository";
import { countStaffOnDuty } from "../domain/usecases/countStaffOnDuty";
import { calculateTaskProgress } from "../domain/usecases/calculateTaskProgress";
import staffService from "../api/staffService";

const TODAY_DAY_ID = "wed";

// Application layer: encapsulates Staff Scheduling page state and data wiring.
export function useStaffScheduling() {
  const statusBanner = getStatusBanner();
  const header = getOverviewHeader();
  const weekRangeLabel = getWeekRangeLabel();
  const headerActions = getHeaderActions();
  const kpis = getKpis();
  const weekDays = getWeekDays();
  const departments = getDepartments();
  const shiftLegend = getShiftLegend();
  const attendanceLegend = getAttendanceLegend();
  const handoverTag = getHandoverTag();
  const handoverChecklist = getHandoverChecklist();
  const handoverNote = getHandoverNote();

  const [checkedHandoverItems, setCheckedHandoverItems] = useState(
    () => new Set(handoverChecklist.map((item) => item.id))
  );
  const [twoFactorConfirmed, setTwoFactorConfirmed] = useState(false);

  // Real Daily Staff Tasks from GET /api/staff/tasks & PUT /api/staff/tasks/{id}/status
  const [apiTasks, setApiTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const data = await staffService.getStaffTasks();
      setApiTasks(Array.isArray(data) ? data : []);
    } catch {
      setApiTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fieldTasks = useMemo(() => {
    return apiTasks.map((t) => {
      const statusMeta = getTaskStatusMeta(t.status);
      const typeMeta = getTaskTypeMeta(t.taskType);
      const mappedStatus =
        statusMeta.key === "done"
          ? "done"
          : statusMeta.key === "in_progress"
          ? "doing"
          : "waiting";
      return {
        id: t.id,
        isRealTask: true,
        rawStatus: statusMeta.key,
        progressPercent: t.progressPercent ?? 0,
        title: t.title,
        status: mappedStatus,
        statusLabel: `${statusMeta.displayLabel} (${t.progressPercent ?? 0}%)`,
        note: `${typeMeta.label} • Cơ sở ${t.facilityCode || "#" + t.facilityId}`,
        assignee: t.assignedEmployeeName || "Nhân viên ca trực",
        detail: t.dueAt
          ? `Hạn: ${new Date(t.dueAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Trong ca trực",
      };
    });
  }, [apiTasks]);

  const handleUpdateFieldTaskStatus = useCallback(
    async (taskId, newStatus, progressPercent) => {
      if (!taskId) return;
      setUpdatingTaskId(taskId);
      try {
        const updated = await staffService.updateTaskStatus(taskId, {
          status: newStatus,
          progressPercent,
        });
        if (updated) {
          setApiTasks((prev) =>
            prev.map((item) => (Number(item.id) === Number(taskId) ? updated : item))
          );
        } else {
          await fetchTasks();
        }
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [fetchTasks]
  );

  const onDutyToday = useMemo(() => countStaffOnDuty(departments, TODAY_DAY_ID), [departments]);
  const taskProgress = useMemo(() => calculateTaskProgress(fieldTasks), [fieldTasks]);

  const toggleHandoverItem = (id) => {
    setCheckedHandoverItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canApproveHandover =
    twoFactorConfirmed && checkedHandoverItems.size === handoverChecklist.length;

  return {
    statusBanner,
    header,
    weekRangeLabel,
    headerActions,
    kpis,
    onDutyToday,
    totalStaff: kpis[0].value,
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
  };
}

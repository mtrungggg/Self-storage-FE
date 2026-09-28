import { useMemo, useState } from "react";
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
  getFieldTasks,
  getHandoverTag,
  getHandoverChecklist,
  getHandoverNote,
} from "../data/staffSchedulingRepository";
import { countStaffOnDuty } from "../domain/usecases/countStaffOnDuty";
import { calculateTaskProgress } from "../domain/usecases/calculateTaskProgress";

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
  const fieldTasks = getFieldTasks();
  const handoverTag = getHandoverTag();
  const handoverChecklist = getHandoverChecklist();
  const handoverNote = getHandoverNote();

  const [checkedHandoverItems, setCheckedHandoverItems] = useState(
    () => new Set(handoverChecklist.map((item) => item.id))
  );
  const [twoFactorConfirmed, setTwoFactorConfirmed] = useState(false);

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

  const canApproveHandover = twoFactorConfirmed && checkedHandoverItems.size === handoverChecklist.length;

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

import { useEffect, useMemo, useState } from "react";
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
  getScheduleItems,
} from "../data/staffDashboardRepository";
import { filterFacilityUnits } from "../domain/usecases/filterFacilityUnits";
import { countUnitsByStatus } from "../domain/usecases/countUnitsByStatus";
import { filterScheduleByType } from "../domain/usecases/filterScheduleByType";

// Application layer: encapsulates Staff Dashboard state, filtering and data wiring.
export function useStaffDashboard() {
  const profile = getStaffProfile();
  const navTabs = getNavTabs();
  const kpis = getKpis();
  const zones = getZones();
  const floors = getFloors();
  const units = getUnits();
  const legend = getLegend();
  const handover = getHandover();
  const scheduleTabs = getScheduleTabs();
  const scheduleItems = getScheduleItems();

  const [activeNavTab, setActiveNavTab] = useState("map");
  const [activeZone, setActiveZone] = useState("all");
  const [activeFloor, setActiveFloor] = useState("floor1");
  const [activeScheduleTab, setActiveScheduleTab] = useState("checkin");
  const [checkedItems, setCheckedItems] = useState(() => new Set(handover.checklist.map((item) => item.id)));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredUnits = useMemo(
    () => filterFacilityUnits(units, activeZone, activeFloor),
    [units, activeZone, activeFloor]
  );

  const legendWithCounts = useMemo(
    () => legend.map((item) => ({ ...item, count: countUnitsByStatus(units, item.id) })),
    [units, legend]
  );

  const filteredSchedule = useMemo(
    () => filterScheduleByType(scheduleItems, activeScheduleTab),
    [scheduleItems, activeScheduleTab]
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
    kpis,
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
  };
}

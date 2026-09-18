import { useMemo, useState } from "react";
import {
  getLiveBanner,
  getOverviewHeader,
  getOverviewActions,
  getKpis,
  getRevenueTrend,
  getRevenueMix,
  getFloorFilters,
  getFloorStatusTabs,
  getFloorZoneLabel,
  getFloorUnits,
  getUnitDetails,
  getFloorFootnote,
  getPolicyDefaults,
  getVouchers,
} from "../data/operationsOverviewRepository";
import { filterFacilityUnits } from "../domain/usecases/filterFacilityUnits";
import { filterUnitsByStatus } from "../domain/usecases/filterUnitsByStatus";
import { countUnitsByStatus } from "../domain/usecases/countUnitsByStatus";
import { calculateRevenueTotals } from "../domain/usecases/calculateRevenueTotals";
import { buildChartPath } from "../domain/usecases/buildChartPath";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;

// Application layer: encapsulates Operations & Revenue Overview page state and data wiring.
export function useOperationsOverview() {
  const liveBanner = getLiveBanner();
  const header = getOverviewHeader();
  const actions = getOverviewActions();
  const kpis = getKpis();
  const revenueTrend = getRevenueTrend();
  const revenueMix = getRevenueMix();
  const floorFilters = getFloorFilters();
  const floorStatusTabs = getFloorStatusTabs();
  const floorZoneLabel = getFloorZoneLabel();
  const floorUnits = getFloorUnits();
  const unitDetails = getUnitDetails();
  const floorFootnote = getFloorFootnote();
  const vouchers = getVouchers();

  const [activeFloor, setActiveFloor] = useState("floor2");
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [selectedUnitId, setSelectedUnitId] = useState("B-204");
  const [policy, setPolicy] = useState(getPolicyDefaults());

  const floorUnitsForFloor = useMemo(
    () => filterFacilityUnits(floorUnits, "all", activeFloor),
    [floorUnits, activeFloor]
  );
  const filteredUnits = useMemo(
    () => filterUnitsByStatus(floorUnitsForFloor, activeStatusTab),
    [floorUnitsForFloor, activeStatusTab]
  );
  const statusTabCounts = useMemo(
    () =>
      floorStatusTabs.map((tab) => ({
        ...tab,
        count: tab.id === "all" ? floorUnitsForFloor.length : countUnitsByStatus(floorUnitsForFloor, tab.id),
      })),
    [floorStatusTabs, floorUnitsForFloor]
  );

  const revenueTotals = useMemo(
    () => calculateRevenueTotals(revenueTrend.hub04, revenueTrend.otherHubs),
    [revenueTrend]
  );
  const revenueMaxValue = useMemo(
    () => Math.max(...revenueTotals, revenueTrend.target) * 1.05,
    [revenueTotals, revenueTrend.target]
  );
  const revenueTrendPath = useMemo(
    () => buildChartPath(revenueTotals, 0, revenueMaxValue, CHART_WIDTH, CHART_HEIGHT),
    [revenueTotals, revenueMaxValue]
  );
  const revenueTargetY = CHART_HEIGHT - (revenueTrend.target / revenueMaxValue) * CHART_HEIGHT;

  const selectedUnit = unitDetails[selectedUnitId] ?? null;

  const updatePolicy = (key, value) => setPolicy((prev) => ({ ...prev, [key]: value }));

  return {
    liveBanner,
    header,
    actions,
    kpis,
    revenueTrend,
    revenueTotals,
    revenueMaxValue,
    revenueTrendPath,
    revenueTargetY,
    chartWidth: CHART_WIDTH,
    chartHeight: CHART_HEIGHT,
    revenueMix,
    floorFilters,
    activeFloor,
    setActiveFloor,
    statusTabCounts,
    activeStatusTab,
    setActiveStatusTab,
    floorZoneLabel,
    filteredUnits,
    selectedUnitId,
    setSelectedUnitId,
    selectedUnit,
    floorFootnote,
    policy,
    updatePolicy,
    vouchers,
  };
}

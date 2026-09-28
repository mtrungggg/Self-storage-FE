import { useMemo, useState } from "react";
import {
  getStatusBanner,
  getOverviewHeader,
  getHeaderActions,
  getKpis,
  getFilters,
  getUnits,
  getUnitDetails,
} from "../data/facilityManagementRepository";
import { filterUnitRecords } from "../domain/usecases/filterUnitRecords";

const DEFAULT_FILTERS = { floor: "all", zone: "all", size: "all", status: "all" };

// Application layer: encapsulates Facility & Unit Management page state and data wiring.
export function useFacilityManagement() {
  const statusBanner = getStatusBanner();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const kpis = getKpis();
  const filterOptions = getFilters();
  const units = getUnits();
  const unitDetails = getUnitDetails();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedUnitId, setSelectedUnitId] = useState("B-204");

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filteredUnits = useMemo(() => filterUnitRecords(units, filters), [units, filters]);
  const selectedUnit = unitDetails[selectedUnitId] ?? null;

  return {
    statusBanner,
    header,
    headerActions,
    kpis,
    filterOptions,
    filters,
    updateFilter,
    resetFilters,
    totalUnits: units.length,
    filteredUnits,
    selectedUnitId,
    setSelectedUnitId,
    selectedUnit,
  };
}

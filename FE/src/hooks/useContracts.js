import { useMemo, useState } from "react";
import {
  getStatusBanner,
  getOverviewHeader,
  getHeaderActions,
  getKpis,
  getFilterOptions,
  getContractLegend,
  getContracts,
  getContractFootnote,
  getEmergencyActions,
  getIotStatusNote,
  getActivityLog,
  getComplianceInfo,
} from "../data/contractsRepository";
import { filterContracts } from "../domain/usecases/filterContracts";

const DEFAULT_FILTERS = { audience: "all", cycle: "all", validity: "all" };

// Application layer: encapsulates Contracts & Customers CRM page state and data wiring.
export function useContracts() {
  const statusBanner = getStatusBanner();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const kpis = getKpis();
  const filterOptions = getFilterOptions();
  const contractLegend = getContractLegend();
  const contracts = getContracts();
  const contractFootnote = getContractFootnote();
  const emergencyActions = getEmergencyActions();
  const iotStatusNote = getIotStatusNote();
  const activityLog = getActivityLog();
  const complianceInfo = getComplianceInfo();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filteredContracts = useMemo(
    () => filterContracts(contracts, { search, ...filters }),
    [contracts, search, filters]
  );

  return {
    statusBanner,
    header,
    headerActions,
    kpis,
    filterOptions,
    search,
    setSearch,
    filters,
    updateFilter,
    contractLegend,
    totalContracts: contracts.length,
    filteredContracts,
    contractFootnote,
    emergencyActions,
    iotStatusNote,
    activityLog,
    complianceInfo,
  };
}

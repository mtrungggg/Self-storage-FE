import { useMemo, useState } from "react";
import {
  getBreadcrumb,
  getOverviewHeader,
  getHeaderActions,
  getSectionTabs,
  getKpis,
  getFilterOptions,
  getQuickFilters,
  getAuditEvents,
  getAuditFootnote,
  getComplianceCards,
} from "../data/auditLogRepository";
import { filterAuditTrail } from "../domain/usecases/filterAuditTrail";

const DEFAULT_FILTERS = { category: "all", status: "all", actorType: "all" };

// Application layer: encapsulates System Activity & Audit Log page state and data wiring.
export function useAuditLog() {
  const breadcrumb = getBreadcrumb();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const sectionTabs = getSectionTabs();
  const kpis = getKpis();
  const filterOptions = getFilterOptions();
  const quickFilters = getQuickFilters();
  const auditEvents = getAuditEvents();
  const auditFootnote = getAuditFootnote();
  const complianceCards = getComplianceCards();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const applyQuickFilter = (value) => setSearch(value);

  const filteredEvents = useMemo(
    () => filterAuditTrail(auditEvents, { search, ...filters }),
    [auditEvents, search, filters]
  );

  return {
    breadcrumb,
    header,
    headerActions,
    sectionTabs,
    kpis,
    filterOptions,
    quickFilters,
    search,
    setSearch,
    filters,
    updateFilter,
    applyQuickFilter,
    filteredEvents,
    totalEvents: auditEvents.length,
    auditFootnote,
    complianceCards,
  };
}

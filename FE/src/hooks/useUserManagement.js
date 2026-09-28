import { useMemo, useState } from "react";
import {
  getBreadcrumb,
  getOverviewHeader,
  getHeaderActions,
  getSectionTabs,
  getKpis,
  getFilterOptions,
  getUsers,
  getFootnote,
  getSelectedUserDetail,
  getComplianceFootnote,
} from "../data/userManagementRepository";
import { filterUsers } from "../domain/usecases/filterUsers";

const DEFAULT_FILTERS = { role: "all", facility: "all", status: "all", twoFactorMethod: "all" };

// Application layer: encapsulates User Management page state and data wiring.
export function useUserManagement() {
  const breadcrumb = getBreadcrumb();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const sectionTabs = getSectionTabs();
  const kpis = getKpis();
  const filterOptions = getFilterOptions();
  const users = getUsers();
  const footnote = getFootnote();
  const selectedUserDetail = getSelectedUserDetail();
  const complianceFootnote = getComplianceFootnote();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filteredUsers = useMemo(() => filterUsers(users, { search, ...filters }), [users, search, filters]);

  return {
    breadcrumb,
    header,
    headerActions,
    sectionTabs,
    kpis,
    filterOptions,
    search,
    setSearch,
    filters,
    updateFilter,
    totalUsers: users.length,
    filteredUsers,
    footnote,
    selectedUserDetail,
    complianceFootnote,
  };
}

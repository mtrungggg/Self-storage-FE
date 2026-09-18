import {
  getAdminProfile,
  getActiveHub,
  getSystemStatusBanner,
  getSidebarNav,
  getSidebarFooter,
  getSidebarSectionBadge,
  getSidebarNetworkStatus,
} from "../data/adminShellRepository";

// Application layer: wires the shared Admin console chrome (sidebar + topbar) data.
export function useAdminShell() {
  return {
    profile: getAdminProfile(),
    activeHub: getActiveHub(),
    statusBanner: getSystemStatusBanner(),
    sidebarNav: getSidebarNav(),
    sidebarFooter: getSidebarFooter(),
    sidebarSectionBadge: getSidebarSectionBadge(),
    sidebarNetworkStatus: getSidebarNetworkStatus(),
  };
}

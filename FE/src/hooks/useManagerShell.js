import { useAuth } from "../context/AuthContext";
import { useManagerFacility } from "../context/ManagerFacilityContext";

// Application layer: wires the shared Manager console chrome (sidebar + topbar) data.
export function useManagerShell() {
  const { user } = useAuth();
  const { activeFacility, loading } = useManagerFacility();

  const profile = { name: user?.fullName || "Facility Manager", role: "Facility Manager" };
  const activeHub = loading ? "Đang tải kho..." : activeFacility?.name || "Chưa chọn kho";
  const statusBanner = { label: "Manager Console", detail: "Kết nối trực tiếp API" };

  const sidebarNav = [
    {
      id: "operations",
      label: "Vận hành kho",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard", to: "/manager-dashboard" },
        { id: "units", label: "Ô kho & Sơ đồ", icon: "grid_view", to: "/manager-units" },
        { id: "transfer-requests", label: "Yêu cầu chuyển ô", icon: "swap_horiz", to: "/manager-transfer-requests" },
        { id: "shifts", label: "Ca làm việc", icon: "groups", to: "/manager-shifts" },
      ],
    },
    {
      id: "finance",
      label: "Tài chính & Hợp đồng",
      items: [
        { id: "charge-proposals", label: "Duyệt phụ phí", icon: "receipt_long", to: "/manager-charge-proposals" },
        { id: "refund-approvals", label: "Duyệt hoàn tiền", icon: "currency_exchange", to: "/manager-refund-approvals" },
        { id: "agreements", label: "Hợp đồng thuê", icon: "description", to: "/manager-agreements" },
        { id: "delinquent-cases", label: "Nợ quá hạn", icon: "report", to: "/manager-delinquent-cases" },
      ],
    },
  ];

  const sidebarFooter = { version: "v1.0-MANAGER" };
  const sidebarSectionBadge = { label: "Manager Console", tag: "FACILITY" };
  const sidebarNetworkStatus = { label: "Encrypted Facility Net", detail: "TLS 1.3 • AES-256" };

  return { profile, activeHub, statusBanner, sidebarNav, sidebarFooter, sidebarSectionBadge, sidebarNetworkStatus };
}

export default useManagerShell;

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { useManagementShell } from "../hooks/useManagementShell";
import { ManagerFacilityProvider } from "../context/ManagerFacilityContext";
import PageBackground from "../components/PageBackground";
import FacilitySwitcher from "../components/FacilitySwitcher";

function ManagementShell() {
  const {
    profile,
    activeHub,
    statusBanner,
    sidebarNav,
    sidebarFooter,
    sidebarSectionBadge,
    sidebarNetworkStatus,
    logout,
  } = useManagementShell();

  const { pathname } = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Khớp item menu đang kích hoạt: chính xác hoặc tiền tố cho các trang chi tiết
  const activeId = sidebarNav
    .flatMap((group) => group.items)
    .find(
      (item) =>
        pathname === item.to ||
        (item.to !== "/admin-overview" && item.to !== "/manager-dashboard" && pathname.startsWith(item.to))
    )?.id;

  // Hiển thị thanh FacilitySwitcher khi đang ở các trang Manager để quản lý kho
  const isManagerRoute = pathname.startsWith("/manager-");

  return (
    <div className="relative flex min-h-screen text-[#0b1c30]">
      <PageBackground />
      <AdminSidebar
        navGroups={sidebarNav}
        activeId={activeId}
        footer={sidebarFooter}
        sectionBadge={sidebarSectionBadge}
        networkStatus={sidebarNetworkStatus}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          activeHub={activeHub}
          statusBanner={statusBanner}
          profile={profile}
          logout={logout}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        {isManagerRoute && <FacilitySwitcher />}
        <main className="flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Layout hợp nhất cho toàn bộ giao diện quản trị (Admin & Manager).
 * Đảm bảo dùng chung khung giao diện (Sidebar, Topbar, FacilityProvider)
 * nhưng vẫn phân quyền và tách biệt các chức năng và Dashboard của từng bên.
 */
export function AdminLayouts() {
  return (
    <ManagerFacilityProvider>
      <ManagementShell />
    </ManagerFacilityProvider>
  );
}

export default AdminLayouts;

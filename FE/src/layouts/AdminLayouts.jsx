import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { useManagementShell } from "../hooks/useManagementShell";
import { ManagerFacilityProvider } from "../context/ManagerFacilityContext";
import "../styles/admin.css";
import "../styles/admin-reference.css";
import FacilitySwitcher from "../components/FacilitySwitcher";

function ManagementShell() {
  const {
    profile,
    sidebarNav,
    logout,
  } = useManagementShell();

  const { pathname } = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Khớp item menu đang kích hoạt: chính xác hoặc tiền tố cho các trang chi tiết
  const activeId = sidebarNav
    .flatMap((group) => group.items)
    .find(
      (item) =>
        pathname === item.to ||
        (item.to !== "/admin-overview" && pathname.startsWith(item.to))
    )?.id;

  // Hiển thị thanh FacilitySwitcher khi đang ở các trang Manager để quản lý kho
  const isManagerRoute = pathname.startsWith("/manager-");

  return (
    <div className={`admin-shell ${profile?.isAdmin ? "admin-reference" : ""} relative flex min-h-screen text-[#0b1c30]`}>
      <AdminSidebar
        navGroups={sidebarNav}
        activeId={activeId}
        isOpen={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        isAdmin={profile?.isAdmin}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          profile={profile}
          navGroups={sidebarNav}
          activeId={activeId}
          pageTitle={sidebarNav.flatMap((group) => group.items).find((item) => item.id === activeId)?.label}
          logout={logout}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        {isManagerRoute && <FacilitySwitcher />}
        <main id="admin-content" className="admin-content min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
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

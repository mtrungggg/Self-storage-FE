import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { useAdminShell } from "../hooks/useAdminShell";

// Composition root for admin-facing management routes: renders the shared
// sidebar/topbar chrome once and highlights the nav item matching the current route.
function AdminLayouts() {
  const { profile, activeHub, statusBanner, sidebarNav, sidebarFooter, sidebarSectionBadge, sidebarNetworkStatus } = useAdminShell();
  const { pathname } = useLocation();
  const activeId = sidebarNav.flatMap((group) => group.items).find((item) => item.to === pathname)?.id;

  return (
    <div className="flex min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <AdminSidebar
        navGroups={sidebarNav}
        activeId={activeId}
        footer={sidebarFooter}
        sectionBadge={sidebarSectionBadge}
        networkStatus={sidebarNetworkStatus}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar activeHub={activeHub} statusBanner={statusBanner} profile={profile} />
        <main className="flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayouts;

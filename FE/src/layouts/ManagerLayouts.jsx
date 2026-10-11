import { Outlet, useLocation } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";
import ManagerTopbar from "../components/ManagerTopbar";
import { useManagerShell } from "../hooks/useManagerShell";
import PageBackground from "../components/PageBackground";

// Composition root for manager-facing management routes: renders the shared
// sidebar/topbar chrome once and highlights the nav item matching the current route.
function ManagerLayouts() {
  const {
    profile,
    activeHub,
    sidebarNav,
    sidebarSectionBadge,
    handleLogout,
  } = useManagerShell();
  const { pathname } = useLocation();
  const activeId = sidebarNav.flatMap((group) => group.items).find((item) => item.to === pathname)?.id;

  return (
    <div className="relative flex min-h-screen text-[#0b1c30]">
      <PageBackground />
      <ManagerSidebar
        navGroups={sidebarNav}
        activeId={activeId}
        sectionBadge={sidebarSectionBadge}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ManagerTopbar
          activeHub={activeHub}
          profile={profile}
          onLogout={handleLogout}
        />
        <main className="flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ManagerLayouts;

import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import PageBackground from "../components/PageBackground";
import { useManagerShell } from "../hooks/useManagerShell";
import { ManagerFacilityProvider, useManagerFacility } from "../context/ManagerFacilityContext";

// Thanh chọn kho (facility) dùng chung cho toàn bộ các trang Manager vì API Manager yêu cầu facilityId.
function FacilitySwitcher() {
  const { facilities, facilityId, setFacilityId, loading, error } = useManagerFacility();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f8] bg-white px-4 py-2 lg:px-6">
      <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">domain</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Kho đang quản lý</span>
      {loading ? (
        <span className="text-[11px] text-[#8996a9]">Đang tải danh sách kho...</span>
      ) : error ? (
        <span className="text-[11px] text-[#c0362c]">{error}</span>
      ) : (
        <select
          value={facilityId ?? ""}
          onChange={(event) => setFacilityId(Number(event.target.value))}
          className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
        >
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.code} — {facility.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function ManagerShell() {
  const { profile, activeHub, statusBanner, sidebarNav, sidebarFooter, sidebarSectionBadge, sidebarNetworkStatus } = useManagerShell();
  const { pathname } = useLocation();
  const activeId = sidebarNav.flatMap((group) => group.items).find((item) => item.to === pathname)?.id;

  return (
    <div className="relative flex min-h-screen text-[#0b1c30]">
      <PageBackground />
      <AdminSidebar
        navGroups={sidebarNav}
        activeId={activeId}
        footer={sidebarFooter}
        sectionBadge={sidebarSectionBadge}
        networkStatus={sidebarNetworkStatus}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar activeHub={activeHub} statusBanner={statusBanner} profile={profile} />
        <FacilitySwitcher />
        <main className="flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Composition root for manager-facing facility operations routes.
function ManagerLayouts() {
  return (
    <ManagerFacilityProvider>
      <ManagerShell />
    </ManagerFacilityProvider>
  );
}

export default ManagerLayouts;

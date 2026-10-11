import { Link } from "react-router-dom";

// Shared topbar used by every Manager console page.
function ManagerTopbar({ activeHub, profile, onLogout }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-[#e6ebf5] bg-white px-4 lg:px-6">
      <div className="hidden items-center gap-1 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a] md:flex">
        <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">domain</span>
        {activeHub}
      </div>

      <div className="hidden items-center gap-1.5 rounded-[8px] bg-[#f5f7fd] px-2.5 py-1.5 text-[11px] font-bold text-[#1d5fe5] sm:flex">
        <span className="material-symbols-outlined text-[15px]">verified_user</span>
        {profile.role}
      </div>

      <div className="flex-1" />

      <Link
        to="/staff-dashboard"
        className="hidden items-center gap-1 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[10px] font-bold text-[#3a475a] transition hover:bg-[#f5f7fd] sm:flex"
      >
        <span className="material-symbols-outlined text-[14px]">badge</span>
        Staff Portal
      </Link>

      <div className="flex items-center gap-2 border-l border-[#eef1f8] pl-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d5fe5] text-white">
          <span className="material-symbols-outlined text-[16px]">person</span>
        </div>
        <div className="hidden leading-tight lg:block">
          <div className="text-[11px] font-bold text-[#0b1c30]">{profile.name}</div>
          <div className="text-[9px] text-[#8996a9]">{profile.role}</div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="ml-1 flex items-center gap-1 rounded-[8px] border border-[#f5d0d0] bg-[#fdf4f4] px-2.5 py-1.5 text-[10px] font-bold text-[#c0362c] transition hover:bg-[#fbe4e4]"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default ManagerTopbar;

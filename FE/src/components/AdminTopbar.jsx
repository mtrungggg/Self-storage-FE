import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Topbar thanh điều hướng trên cùng dùng chung cho cả Admin và Manager.
 * - Hỗ trợ mở menu trên điện thoại di động (hamburger).
 * - Hiển thị cơ sở kho đang chọn hoặc trạng thái toàn hệ thống.
 * - Menu tài khoản người dùng với Avatar, tên, vai trò và nút Đăng xuất.
 */
function AdminTopbar({ activeHub, statusBanner, profile, onToggleMobileSidebar, logout }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  const initial = (profile?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="relative z-40 flex h-14 items-center justify-between gap-3 border-b border-[#e6ebf5] bg-white px-4 lg:px-6">
      {/* Mobile toggle button & Active Hub display */}
      <div className="flex items-center gap-2">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e6ebf5] text-[#58657a] hover:bg-[#f5f7fd] lg:hidden"
            title="Mở menu điều hướng"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}

        <div className="hidden items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-[#fafbfd] px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] sm:flex">
          <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">domain</span>
          <span className="truncate max-w-[200px] md:max-w-[280px]">{activeHub}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex max-w-[340px] flex-1 items-center gap-1.5 rounded-[8px] bg-[#f5f7fd] px-3 py-1.5">
        <span className="material-symbols-outlined text-[15px] text-[#8996a9]">search</span>
        <input
          placeholder="Tìm kiếm dữ liệu, ID, cơ sở..."
          className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8996a9]"
        />
      </div>

      {/* Status banner, quick icons & Profile menu */}
      <div className="flex items-center gap-2.5">
        {statusBanner && (
          <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#0e7b4c] xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
            {statusBanner.label} • {statusBanner.detail}
          </span>
        )}

        {/* User Profile Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-[#dfe7f5] bg-white p-1 pr-2.5 transition hover:bg-[#f8faff] hover:border-[#1d5fe5]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b1c30] text-[12px] font-bold text-white shadow-xs">
              {initial}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <div className="max-w-[130px] truncate text-[11px] font-bold text-[#0b1c30]">
                {profile?.name || "Tài khoản"}
              </div>
              <div className="truncate text-[9px] font-medium text-[#8996a9]">
                {profile?.role || "Console"}
              </div>
            </div>
            <span className="material-symbols-outlined text-[15px] text-[#8996a9]">expand_more</span>
          </button>

          {/* User Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-[12px] border border-[#dfe7f5] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.12)] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-[#f0f3f8] px-3 py-2.5">
                <div className="truncate text-[12px] font-bold text-[#0b1c30]">{profile?.name}</div>
                {profile?.email && (
                  <div className="truncate text-[10px] text-[#8996a9]">{profile?.email}</div>
                )}
                <div className="mt-1">
                  <span className="inline-block rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
                    {profile?.role}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 py-1">
                <Link
                  to="/admin-overview"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[11px] font-semibold text-[#58657a] hover:bg-[#f5f7fd] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">dashboard</span>
                  Dashboard Admin
                </Link>

                <Link
                  to="/manager-dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[11px] font-semibold text-[#58657a] hover:bg-[#f5f7fd] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">space_dashboard</span>
                  Dashboard Manager
                </Link>

                <Link
                  to="/home"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[11px] font-semibold text-[#58657a] hover:bg-[#f5f7fd] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#7b8a9f]">storefront</span>
                  Trang chủ khách hàng
                </Link>
              </div>

              <div className="border-t border-[#f0f3f8] pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;

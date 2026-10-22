import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, ChevronRight, LayoutDashboard, LogOut, Store, CalendarDays, Box, Boxes, SlidersHorizontal, Users, History, ShieldCheck } from "lucide-react";

const adminNavigation = {
  "admin-overview": ["Dashboard", LayoutDashboard],
  "admin-facilities": ["Cơ sở kho", Boxes],
  "admin-pricing": ["Bảng giá", SlidersHorizontal],
  "admin-users": ["Tài khoản", Users],
  "admin-audit-log": ["Kiểm toán", History],
  "admin-login-histories": ["Đăng nhập", ShieldCheck],
};

export default function AdminTopbar({ profile, pageTitle, navGroups = [], activeId, onToggleMobileSidebar, logout }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!profileOpen) return;
    const closeOutside = (event) => { if (!dropdownRef.current?.contains(event.target)) setProfileOpen(false); };
    const closeEscape = (event) => { if (event.key === "Escape") { setProfileOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("mousedown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [profileOpen]);
  const initial = (profile?.name || "U").charAt(0).toUpperCase();
  return <header className="admin-topbar">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onToggleMobileSidebar} className="admin-icon-button lg:hidden" aria-label="Mở menu điều hướng"><Menu size={21} /></button>
      {profile?.isAdmin ? <Link to="/admin-overview" className="reference-brand"><Box size={29} strokeWidth={2.2} /><span>G1<span className="reference-brand-detail"> Storage</span></span></Link> : <div className="flex min-w-0 items-center gap-2 text-sm"><span className="hidden text-slate-400 md:inline">Quản trị</span><ChevronRight size={14} className="hidden text-slate-300 md:block" /><span className="truncate font-semibold">{pageTitle || "Không gian quản trị"}</span></div>}
    </div>
    {profile?.isAdmin && <nav className="reference-nav" aria-label="Điều hướng quản trị">
      {navGroups.flatMap((group) => group.items).map((item) => {
        const [label, Icon] = adminNavigation[item.id] || [item.label, Box];
        return <Link key={item.id} to={item.to} aria-current={activeId === item.id ? "page" : undefined}><Icon size={19} strokeWidth={1.5} /><span>{label}</span></Link>;
      })}
    </nav>}
    <div className="flex shrink-0 items-center gap-5">
      {!profile?.isAdmin && <span className="hidden items-center gap-2 text-xs text-slate-500 xl:flex"><CalendarDays size={16} />{new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())}</span>}
      <div className="relative" ref={dropdownRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false); }}>
        <button ref={triggerRef} type="button" aria-expanded={profileOpen} aria-controls="admin-profile-menu" onClick={() => setProfileOpen(!profileOpen)} className="admin-profile-trigger">
          <span className="admin-avatar">{initial}</span><span className="hidden text-left sm:block"><strong>{profile?.name || "Tài khoản"}</strong><small>{profile?.role || "Quản trị"}</small></span><ChevronDown size={15} className="text-slate-400" />
        </button>
        {profileOpen && <div id="admin-profile-menu" className="admin-profile-menu">
          <div className="border-b border-slate-100 px-3 py-3"><strong className="block truncate text-sm">{profile?.name}</strong><span className="block truncate text-xs text-slate-500">{profile?.email}</span></div>
          <Link onClick={() => setProfileOpen(false)} to={profile?.isAdmin ? "/admin-overview" : "/manager-units"}><LayoutDashboard size={17} />Không gian quản trị</Link>
          <Link onClick={() => setProfileOpen(false)} to="/home"><Store size={17} />Trang chủ khách hàng</Link>
          <button type="button" onClick={() => { logout?.(); navigate("/login"); }}><LogOut size={17} />Đăng xuất tài khoản</button>
        </div>}
      </div>
    </div>
  </header>;
}

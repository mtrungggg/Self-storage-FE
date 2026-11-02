import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Box, Boxes, Users, History, Bell } from "lucide-react";
import { useManagerFacility } from "../context/ManagerFacilityContext";

const adminNavigation = {
  "admin-overview": ["Dashboard", Box],
  "admin-facilities": ["Facilities", Boxes],
  "admin-users": ["Users & Roles", Users],
  "admin-audit-log": ["Audit & Logs", History],
};

export default function AdminTopbar({ profile, pageTitle, navGroups = [], activeId, onToggleMobileSidebar, logout }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const notifyRef = useRef(null);

  // Get live pending transfer requests from context
  const facilityCtx = useManagerFacility();
  const pendingTransferCount = facilityCtx?.pendingTransferCount ?? 0;
  const pendingTransfers = facilityCtx?.pendingTransfers ?? [];

  useEffect(() => {
    if (!profileOpen && !notifyOpen) return;
    const closeOutside = (event) => {
      if (profileOpen && !dropdownRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifyOpen && !notifyRef.current?.contains(event.target)) {
        setNotifyOpen(false);
      }
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotifyOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [profileOpen, notifyOpen]);

  const initial = (profile?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="admin-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="admin-icon-button lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu size={21} />
        </button>
        {profile?.isAdmin ? (
          <Link to="/admin-overview" className="reference-brand">
            <Box size={24} strokeWidth={2.2} />
            <span>G1<span className="reference-brand-detail">SelfStorage</span></span>
          </Link>
        ) : (
          <div className="flex min-w-0 items-center">
            <h1 className="truncate text-sm font-bold text-slate-800">
              {pageTitle || "Management Console"}
            </h1>
          </div>
        )}
      </div>

      {profile?.isAdmin && (
        <nav className="reference-nav" aria-label="Admin navigation">
          {navGroups.flatMap((group) => group.items).map((item) => {
            const [label, Icon] = adminNavigation[item.id] || [item.label, Box];
            return (
              <Link key={item.id} to={item.to} aria-current={activeId === item.id ? "page" : undefined}>
                <Icon size={19} strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {!profile?.isAdmin && (
          <span className="hidden text-xs font-medium text-slate-500 xl:inline">
            {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date())}
          </span>
        )}

        {/* Notification Bell for Facility Manager */}
        {!profile?.isAdmin && (
          <div className="relative" ref={notifyRef}>
            <button
              type="button"
              onClick={() => setNotifyOpen((prev) => !prev)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
              title="Thông báo yêu cầu chuyển kho"
              aria-label="Thông báo yêu cầu chuyển kho"
            >
              <Bell size={16} />
              {pendingTransferCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white animate-pulse">
                  {pendingTransferCount}
                </span>
              )}
            </button>

            {notifyOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell size={14} className="text-amber-500" />
                    <span>Yêu cầu chuyển kho</span>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                    {pendingTransferCount} chờ duyệt
                  </span>
                </div>

                {pendingTransfers.length === 0 ? (
                  <p className="py-4 text-center text-slate-400 text-xs">Không có yêu cầu chuyển kho nào đang chờ.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {pendingTransfers.slice(0, 5).map((req) => (
                      <Link
                        key={req.id}
                        to="/manager-transfer-requests"
                        onClick={() => setNotifyOpen(false)}
                        className="block rounded-lg border border-amber-100 bg-amber-50/50 p-2.5 transition hover:bg-amber-100/60"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                          <span>{req.customerName || `Khách hàng #${req.customerId}`}</span>
                          <span className="text-[10px] text-amber-700 font-bold">Chờ duyệt</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600">
                          HĐ <span className="font-mono font-semibold">{req.agreementNo}</span>: Kho <span className="font-mono font-bold text-blue-700">{req.fromUnitCode}</span> ➔ {req.requestedUnitTypeName}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to="/manager-transfer-requests"
                  onClick={() => setNotifyOpen(false)}
                  className="mt-2.5 block text-center rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  Xem tất cả yêu cầu chuyển kho &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <div
          className="relative"
          ref={dropdownRef}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
          }}
        >
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={profileOpen}
            aria-controls="admin-profile-menu"
            onClick={() => setProfileOpen(!profileOpen)}
            className="admin-profile-trigger"
          >
            <span className="admin-avatar">{initial}</span>
            <span className="hidden text-left sm:block">
              <strong>{profile?.name || "Account"}</strong>
              <small>{profile?.role || "Administrator"}</small>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div id="admin-profile-menu" className="admin-profile-menu">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <strong className="block truncate text-xs font-semibold text-slate-900">{profile?.name}</strong>
                <span className="block truncate text-[11px] text-slate-500">{profile?.email}</span>
              </div>
              <Link
                onClick={() => setProfileOpen(false)}
                to={profile?.isAdmin ? "/admin-overview" : "/manager-dashboard"}
              >
                Dashboard
              </Link>
              <Link onClick={() => setProfileOpen(false)} to="/staff-dashboard">
                Staff Ops Hub
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout?.();
                  navigate("/login");
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

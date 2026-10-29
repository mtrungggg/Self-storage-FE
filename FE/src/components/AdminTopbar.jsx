import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Box, Boxes, Users, History, ShieldCheck } from "lucide-react";

const adminNavigation = {
  "admin-overview": ["Dashboard", Box],
  "admin-facilities": ["Facilities", Boxes],
  "admin-users": ["Users & Roles", Users],
  "admin-audit-log": ["Audit Logs", History],
  "admin-login-histories": ["Login Activity", ShieldCheck],
};

export default function AdminTopbar({ profile, pageTitle, navGroups = [], activeId, onToggleMobileSidebar, logout }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [profileOpen]);

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
            <span>G1<span className="reference-brand-detail"> Storage</span></span>
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

      <div className="flex shrink-0 items-center gap-4">
        {!profile?.isAdmin && (
          <span className="hidden text-xs font-medium text-slate-500 xl:inline">
            {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date())}
          </span>
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
              <Link onClick={() => setProfileOpen(false)} to="/home">
                Customer Portal
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

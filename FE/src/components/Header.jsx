import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { key: "rent", label: "Rent a Unit", to: "/home", style: "soft" },
  { key: "billing", label: "Invoices", to: "/billing", style: "hard" },
  { key: "access", label: "PIN Code", to: "/access-control", style: "hard" },
];

const ACTIVE_CLASS = {
  soft: "bg-[#eef4ff] text-[#1d5fe5]",
  hard: "bg-[#0b1c30] text-white",
};

// Shared top navigation bar used by every authenticated portal page.
function Header({ active, showUserBadge = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = () => {
    const roles = user?.roles || [];
    if (roles.includes("admin") || roles.includes("system_admin")) return "Administrator";
    if (roles.includes("manager")) return "Facility Manager";
    if (roles.includes("staff") || roles.includes("facility_staff")) return "Operations Staff";
    return "Member Customer";
  };

  return (
    <header className="relative z-50 border-b border-[#e6ebf5] bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1d5fe5] text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
            </div>
            <span className="text-[19px] tracking-tight">
              <span className="font-black text-[#0a3d91]">G1</span>
              <span className="font-bold text-[#0b1c30]">SelfStorage</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isProtected = item.key !== "rent";
            const handleItemClick = (e) => {
              if (isProtected && !user) {
                e.preventDefault();
                navigate("/login", { state: { from: { pathname: item.to } } });
              }
            };

            return item.key === active ? (
              <button
                key={item.key}
                className={`rounded-md px-3 py-2 text-[13px] font-bold ${ACTIVE_CLASS[item.style]}`}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.key}
                to={item.to}
                onClick={handleItemClick}
                className="rounded-md px-3 py-2 text-[13px] font-semibold text-[#58657a] hover:text-[#0b1c30] transition"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <Link to="/support" aria-current={active === "support" ? "page" : undefined} className="hidden items-center gap-1 text-[#58657a] hover:text-[#0b1c30] lg:flex">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              Support
            </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#dfe7f5] bg-white py-1 pl-1 pr-2.5 transition hover:bg-[#f8faff]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b1c30] text-[12px] font-bold text-white">
                  {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                </div>
                {showUserBadge && (
                  <div className="hidden text-left leading-tight lg:block">
                    <div className="max-w-[130px] truncate text-[12px] font-bold text-[#0b1c30]">
                      {user.fullName || user.email?.split("@")[0]}
                    </div>
                  </div>
                )}
                <span className="material-symbols-outlined text-[15px] text-[#8996a9]">expand_more</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-[12px] border border-[#dfe7f5] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.1)] z-50">
                  <div className="border-b border-[#f0f3f8] px-3 py-2">
                    <div className="truncate text-[12px] font-bold text-[#0b1c30]">{user.fullName || "Account"}</div>
                    <div className="truncate text-[11px] text-[#8996a9]">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold text-[#0b1c30] hover:bg-[#f0f4fc]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#174fc7]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

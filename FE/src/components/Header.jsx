import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { ADMIN_ROLES, CUSTOMER_ROLES, MANAGER_ROLES, STAFF_ROLES, hasAnyRole } from "../constants/roles";

const NAV_DEFINITIONS = [
  { key: "rent", labelKey: "nav.rent", fallback: "Rent a Unit", to: "/home", style: "soft" },
  { key: "my-units", labelKey: "nav.my_units", fallback: "My Units", to: "/my-units", style: "soft" },
  { key: "access", labelKey: "nav.pin_code", fallback: "PIN Code", to: "/access-control", style: "hard" },
];

const ACTIVE_CLASS = {
  soft: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold",
  hard: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold",
};

// Shared top navigation bar used by customer and staff portals.
function Header({ active, showUserBadge = true, hideCustomerNav = false }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStaffRole = hasAnyRole(user?.roles || [], [...ADMIN_ROLES, ...MANAGER_ROLES, ...STAFF_ROLES]);
  const isCustomerOnly = Boolean(user) &&
    hasAnyRole(user?.roles || [], CUSTOMER_ROLES) &&
    !hasAnyRole(user?.roles || [], [...ADMIN_ROLES, ...MANAGER_ROLES, ...STAFF_ROLES]);
  const shouldHideCustomerNav = hideCustomerNav || (isStaffRole && (active === "ops" || active === "staff"));

  return (
    <header className="relative z-50 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
            </div>
            <span className="text-[19px] tracking-tight">
              <span className="font-black text-zinc-900 dark:text-zinc-100">G1</span>
              <span className="font-bold text-zinc-600 dark:text-zinc-400">SelfStorage</span>
            </span>
          </Link>

        </div>

        {!shouldHideCustomerNav && (
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_DEFINITIONS.map((item) => {
              const isProtected = item.key !== "rent";
              const label = t(item.labelKey, item.fallback);
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
                  {label}
                </button>
              ) : (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={handleItemClick}
                  className="rounded-md px-3 py-2 text-[13px] font-semibold text-[#58657a] hover:text-[#0b1c30] transition"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 text-[12px] font-semibold text-[#3a475a]">
          {!shouldHideCustomerNav && (
            <Link to="/support" aria-current={active === "support" ? "page" : undefined} className="hidden items-center gap-1 text-[#58657a] hover:text-[#0b1c30] lg:flex">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              {t("nav.support", "Support")}
            </Link>
          )}

          {/* Central Language Switcher [ VIE | ENG ] */}
          <ThemeSwitcher />
          <LanguageSwitcher className="mx-1" />

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#dfe7f5] bg-white py-1 pl-1 pr-2.5 transition hover:bg-[#f8faff] cursor-pointer"
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
                <div className="absolute right-0 top-full mt-2 w-52 rounded-[12px] border border-[#dfe7f5] bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.1)] z-50">
                  <div className="border-b border-[#f0f3f8] px-3 py-2">
                    <div className="truncate text-[12px] font-bold text-[#0b1c30]">{user.fullName || "Account"}</div>
                    <div className="truncate text-[11px] text-[#8996a9]">{user.email}</div>
                  </div>

                  <div className="py-1 border-b border-[#f0f3f8]">
                    {isCustomerOnly && (
                      <>
                        <Link
                          to="/my-units"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] hover:text-zinc-900 dark:text-zinc-100"
                        >
                          <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">warehouse</span>
                          {t("nav.my_units", "My Units")}
                        </Link>
                        <Link
                          to="/billing"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] hover:text-zinc-900 dark:text-zinc-100"
                        >
                          <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">receipt_long</span>
                          {t("nav.billing", "Invoices & Payments")}
                        </Link>
                      </>
                    )}
                    {hasAnyRole(user?.roles || [], ADMIN_ROLES) && (
                      <Link
                        to="/admin-overview"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] hover:text-zinc-900 dark:text-zinc-100"
                      >
                        <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">dashboard</span>
                        {t("nav.admin_dashboard", "Admin Dashboard")}
                      </Link>
                    )}
                    {!hasAnyRole(user?.roles || [], ADMIN_ROLES) && hasAnyRole(user?.roles || [], MANAGER_ROLES) && (
                      <Link
                        to="/manager-units"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] hover:text-zinc-900 dark:text-zinc-100"
                      >
                        <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">space_dashboard</span>
                        {t("nav.manager_ops", "Facility Operations")}
                      </Link>
                    )}
                    {hasAnyRole(user?.roles || [], STAFF_ROLES) && (
                      <>

                        <Link
                          to="/staff-shifts"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-1.5 text-left text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] hover:text-zinc-900 dark:text-zinc-100"
                        >
                          <span className="material-symbols-outlined text-[15px] text-zinc-900 dark:text-zinc-100">calendar_month</span>
                          {t("nav.my_shifts", "My Shifts")}
                        </Link>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    {t("nav.sign_out", "Sign out")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="whitespace-nowrap shrink-0 rounded-[8px] px-2.5 sm:px-3 py-1.5 text-[12px] font-bold text-[#0b1c30] hover:bg-[#f0f4fc] transition-colors"
              >
                {t("nav.sign_in", "Sign in")}
              </Link>
              <Link
                to="/register"
                className="whitespace-nowrap shrink-0 rounded-[8px] bg-zinc-900 text-white px-2.5 sm:px-3 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-zinc-800 transition-colors"
              >
                {t("nav.register", "Register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

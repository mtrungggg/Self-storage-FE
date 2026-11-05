import { Navigate, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES, hasAnyRole } from "../constants/roles";

/**
 * Route protection wrapper for actions & pages that require an authenticated user.
 * Unauthenticated guests are automatically redirected to /login with state preserved.
 * Authenticated users lacking required permissions are presented with an informative access denied state.
 */
export function RequireAuth({ allowedRoles, children }) {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-zinc-900 dark:text-zinc-100">
            progress_activity
          </span>
          <span className="text-[13px] font-semibold text-[#58657a] dark:text-zinc-400">
            {t("common.checking_credentials", "Đang xác thực thông tin đăng nhập...")}
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const roles = (user?.roles || []).map((r) => r.toLowerCase());
    const hasPermission = roles.some((r) => allowedRoles.includes(r.toLowerCase()));
    if (!hasPermission) {
      const isTargetingAdmin = allowedRoles.some((r) => ADMIN_ROLES.includes(r.toLowerCase()));
      const isManager = hasAnyRole(roles, MANAGER_ROLES);
      const isStaff = hasAnyRole(roles, STAFF_ROLES);

      return (
        <div className="flex min-h-[75vh] w-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t("common.access_restricted", "Quyền truy cập bị giới hạn")}
            </h2>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {isTargetingAdmin
                ? "Trang này yêu cầu quyền Quản trị viên hệ thống (System Administrator). Tài khoản hiện tại của bạn không có quyền truy cập."
                : "Bạn không có quyền thực hiện hoặc xem nội dung của trang này."}
            </p>

            <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-left text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
              <div>
                <strong>Tài khoản:</strong> {user.email}
              </div>
              <div>
                <strong>Vai trò:</strong> {user.roles?.join(", ") || "User"}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {isTargetingAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login", { state: { email: "admin@gmail.com" } });
                  }}
                  className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 py-2.5 text-xs font-bold text-white dark:text-zinc-900 shadow-sm hover:opacity-90 transition cursor-pointer"
                >
                  Đăng nhập bằng tài khoản Quản trị viên (admin@gmail.com)
                </button>
              )}
              {isManager && (
                <Link
                  to="/manager-dashboard"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Về Bảng điều khiển Quản lý cơ sở
                </Link>
              )}
              {isStaff && !isManager && (
                <Link
                  to="/staff-dashboard"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Về Bảng điều khiển Nhân viên
                </Link>
              )}
              <Link
                to="/home"
                className="w-full py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
              >
                Về Trang chủ
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children ? children : <Outlet />;
}

export default RequireAuth;

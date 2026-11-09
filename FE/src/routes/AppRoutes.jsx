import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import AdminLayouts from "../layouts/AdminLayouts";
import RequireAuth from "../components/RequireAuth";
import { STAFF_ROLES, MANAGER_ROLES, ADMIN_ROLES, CUSTOMER_ROLES, getDefaultRouteForUser } from "../constants/roles";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../hooks/useAuth";

// Eagerly loaded critical guest routes for instant response
import Home from "../pages/Home";
import AuthScene from "../pages/AuthScene";

// Lazy-loaded customer routes (code-split on demand)
const StorageDetail = lazy(() => import("../pages/StorageDetail"));
const Billing = lazy(() => import("../pages/Billing"));
const PaymentCheckout = lazy(() => import("../pages/PaymentCheckout"));
const ReservationDetail = lazy(() => import("../pages/ReservationDetail"));
const AccessControl = lazy(() => import("../pages/AccessControl"));
const StoragePass = lazy(() => import("../pages/StoragePass"));
const Support = lazy(() => import("../pages/Support"));
const MyUnits = lazy(() => import("../pages/MyUnits"));

// Lazy-loaded staff portal
const StaffDashboard = lazy(() => import("../pages/StaffDashboard"));
const StaffSupportTickets = lazy(() => import("../pages/StaffSupportTickets"));
const StaffMoveOuts = lazy(() => import("../pages/StaffMoveOuts"));
const StaffInspectionsPage = lazy(() => import("../pages/StaffInspectionsPage"));

// Lazy-loaded management & operations portal
const ManagerUnits = lazy(() => import("../pages/ManagerUnits"));
const ManagerDashboard = lazy(() => import("../pages/ManagerDashboard"));
const ManagerTransferRequests = lazy(() => import("../pages/ManagerTransferRequests"));
const ManagerShifts = lazy(() => import("../pages/ManagerShifts"));
const ManagerChargeProposals = lazy(() => import("../pages/ManagerChargeProposals"));
const ManagerRefundApprovals = lazy(() => import("../pages/ManagerRefundApprovals"));
const ManagerAgreements = lazy(() => import("../pages/ManagerAgreements"));
const ManagerAgreementDetailPage = lazy(() => import("../pages/ManagerAgreementDetailPage"));
const ManagerDelinquentCases = lazy(() => import("../pages/ManagerDelinquentCases"));
const ManagerFacilityUsersPage = lazy(() => import("../pages/ManagerFacilityUsersPage"));
const ManagerTicketsPage = lazy(() => import("../pages/ManagerTicketsPage"));
const ManagerExpiringContractsPage = lazy(() => import("../pages/ManagerExpiringContractsPage"));

// Lazy-loaded admin governance portal
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const AdminUserDetail = lazy(() => import("../pages/AdminUserDetail"));
const AdminCrudPage = lazy(() => import("../pages/AdminCrudPage"));
const AdminAuditLog = lazy(() => import("../pages/AdminAuditLog"));
const ManagerPricing = lazy(() => import("../pages/ManagerPricing"));

function RouteSuspenseFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#1d5fe5]">
          progress_activity
        </span>
        <span className="text-[12px] font-semibold text-[#8996a9]">{t("common.loading", "Đang tải dữ liệu...")}</span>
      </div>
    </div>
  );
}

// Nhân viên/Quản lý/Admin đã đăng nhập không xem giao diện khách hàng ở "/home";
// tự động điều hướng về đúng dashboard theo role. Khách/Customer vẫn thấy Home bình thường.
function RoleAwareHome() {
  const { user, loading } = useAuth();
  if (loading) return <RouteSuspenseFallback />;
  if (user) {
    const dest = getDefaultRouteForUser(user);
    if (dest !== "/home") {
      return <Navigate to={dest} replace />;
    }
  }
  return <Home />;
}

// Central route table: public guest exploration (/home) plus protected routes.
function AppRoutes() {
  const location = useLocation();

  return (
    <PageTransition>
      <Suspense fallback={<RouteSuspenseFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Default route opens Home page directly for guest exploration */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<AuthScene />} />
          <Route path="/register" element={<AuthScene />} />

          {/* Public customer browsing */}
          <Route element={<CustomerLayouts />}>
            <Route path="/home" element={<RoleAwareHome />} />
            <Route path="/storage-detail" element={<StorageDetail />} />
            <Route path="/support" element={<Support />} />

            {/* Protected customer routes: require login */}
            <Route element={<RequireAuth />}>
              <Route path="/my-units" element={<MyUnits />} />
              <Route path="/my-storages" element={<Navigate to="/my-units" replace />} />
              <Route path="/access-control" element={<AccessControl />} />
              <Route path="/access-ccontrol" element={<Navigate to="/access-control" replace />} />
              <Route path="/storage-pass" element={<StoragePass />} />
              <Route path="/storage-management" element={<StoragePass />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={CUSTOMER_ROLES} />}>
              <Route path="/checkout" element={<PaymentCheckout />} />
              <Route path="/reservations/:id" element={<ReservationDetail />} />
              <Route path="/payment" element={<PaymentCheckout />} />
              <Route path="/billing" element={<Billing />} />
            </Route>
          </Route>

          {/* Protected staff portal */}
          <Route element={<RequireAuth allowedRoles={STAFF_ROLES} />}>
            <Route element={<StaffLayouts />}>
              <Route path="/staff-dashboard" element={<StaffDashboard />} />
              <Route path="/staff-shifts" element={<StaffDashboard initialTab="shifts" />} />
              <Route path="/staff-support-tickets" element={<Navigate to="/staff-dashboard" replace />} />
              <Route path="/staff-tickets" element={<Navigate to="/staff-dashboard" replace />} />
              <Route path="/staff-move-outs" element={<StaffInspectionsPage />} />
              <Route path="/staff-inspections" element={<StaffInspectionsPage />} />
              {/* Đóng/Vô hiệu hóa toàn bộ route dẫn tới trang tạo đơn tại quầy (Walk-in Booking) */}
              <Route path="/walk-in" element={<Navigate to="/staff-dashboard" replace />} />
              <Route path="/walk-in-booking" element={<Navigate to="/staff-dashboard" replace />} />
              <Route path="/staff-walk-in" element={<Navigate to="/staff-dashboard" replace />} />
              <Route path="/staff-booking" element={<Navigate to="/staff-dashboard" replace />} />
            </Route>
          </Route>

          {/* Protected management portal: shared layout chrome for Manager & Admin */}
          <Route element={<AdminLayouts />}>
            {/* Manager operations console: accessible to Facility Managers & System Administrators */}
            <Route element={<RequireAuth allowedRoles={[...MANAGER_ROLES, ...ADMIN_ROLES]} />}>
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
              <Route path="/manager-units" element={<ManagerUnits />} />
              <Route path="/manager-transfer-requests" element={<ManagerTransferRequests />} />
              <Route path="/manager-shifts" element={<ManagerShifts />} />
              <Route path="/manager-tickets" element={<ManagerTicketsPage />} />
              <Route path="/manager-move-outs" element={<ManagerExpiringContractsPage />} />
              <Route path="/manager-expiring-contracts" element={<ManagerExpiringContractsPage />} />
              <Route path="/manager-charge-proposals" element={<ManagerChargeProposals />} />
              <Route path="/manager-refund-approvals" element={<ManagerRefundApprovals />} />
              <Route path="/manager-agreements" element={<ManagerAgreements />} />
              <Route path="/manager-agreements/:id" element={<ManagerAgreementDetailPage />} />
              <Route path="/manager-delinquent-cases" element={<ManagerDelinquentCases />} />
              <Route path="/manager-pricing" element={<Navigate to="/manager-dashboard" replace />} />
              <Route path="/manager-users" element={<ManagerFacilityUsersPage />} />
              <Route path="/manager-facility-users" element={<ManagerFacilityUsersPage />} />
            </Route>

            {/* Admin governance portal: strictly restricted to System Administrators */}
            <Route element={<RequireAuth allowedRoles={ADMIN_ROLES} />}>
              <Route path="/admin" element={<Navigate to="/admin-overview" replace />} />
              <Route path="/admin-overview" element={<AdminDashboard />} />
              <Route path="/admin-facilities" element={<AdminCrudPage key="facilities" resource="facilities" />} />
              <Route path="/admin-facilities/:id" element={<AdminCrudPage key="facility-detail" resource="facilities" />} />
              <Route path="/admin-users" element={<AdminUsers />} />
              <Route path="/admin-users/:id" element={<AdminUserDetail />} />
              <Route path="/admin-audit-log" element={<AdminAuditLog />} />
              <Route path="/admin-pricing" element={<ManagerPricing />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

export default AppRoutes;

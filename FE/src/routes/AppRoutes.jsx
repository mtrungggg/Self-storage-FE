import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import AdminLayouts from "../layouts/AdminLayouts";
import RequireAuth from "../components/RequireAuth";
import { STAFF_ROLES, MANAGER_ROLES, ADMIN_ROLES, CUSTOMER_ROLES } from "../constants/roles";

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

// Lazy-loaded staff portal
const StaffDashboard = lazy(() => import("../pages/StaffDashboard"));
const StaffSupportTickets = lazy(() => import("../pages/StaffSupportTickets"));
const StaffMoveOuts = lazy(() => import("../pages/StaffMoveOuts"));

// Lazy-loaded management & operations portal
const ManagerUnits = lazy(() => import("../pages/ManagerUnits"));
const ManagerTransferRequests = lazy(() => import("../pages/ManagerTransferRequests"));
const ManagerChargeProposals = lazy(() => import("../pages/ManagerChargeProposals"));
const ManagerRefundApprovals = lazy(() => import("../pages/ManagerRefundApprovals"));
const ManagerAgreements = lazy(() => import("../pages/ManagerAgreements"));
const ManagerDelinquentCases = lazy(() => import("../pages/ManagerDelinquentCases"));

// Lazy-loaded admin governance portal
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const AdminUserDetail = lazy(() => import("../pages/AdminUserDetail"));
const AdminLoginHistories = lazy(() => import("../pages/AdminLoginHistories"));
const AdminAuditLog = lazy(() => import("../pages/AdminAuditLog"));
const AdminCrudPage = lazy(() => import("../pages/AdminCrudPage"));
const ManagerPricing = lazy(() => import("../pages/ManagerPricing"));

function RouteSuspenseFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#1d5fe5]">
          progress_activity
        </span>
        <span className="text-[12px] font-semibold text-[#8996a9]">Đang tải dữ liệu...</span>
      </div>
    </div>
  );
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
            <Route path="/home" element={<Home />} />
            <Route path="/storage-detail" element={<StorageDetail />} />
            <Route path="/support" element={<Support />} />

            {/* Protected customer routes: require login */}
            <Route element={<RequireAuth />}>
              <Route path="/access-control" element={<AccessControl />} />
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
              <Route path="/staff-support-tickets" element={<StaffSupportTickets />} />
              <Route path="/staff-move-outs" element={<StaffMoveOuts />} />
            </Route>
          </Route>

          {/* Protected management portal: shared layout chrome for Manager & Admin */}
          <Route element={<AdminLayouts />}>
            {/* Manager operations console: accessible to Facility Managers & System Administrators */}
            <Route element={<RequireAuth allowedRoles={[...MANAGER_ROLES, ...ADMIN_ROLES]} />}>
              <Route path="/manager-dashboard" element={<Navigate to="/manager-units" replace />} />
              <Route path="/manager-units" element={<ManagerUnits />} />
              <Route path="/manager-transfer-requests" element={<ManagerTransferRequests />} />
              <Route path="/manager-tickets" element={<Navigate to="/manager-units" replace />} />
              <Route path="/manager-move-outs" element={<StaffMoveOuts />} />
              <Route path="/manager-charge-proposals" element={<ManagerChargeProposals />} />
              <Route path="/manager-refund-approvals" element={<ManagerRefundApprovals />} />
              <Route path="/manager-agreements" element={<ManagerAgreements />} />
              <Route path="/manager-delinquent-cases" element={<ManagerDelinquentCases />} />
              <Route path="/manager-pricing" element={<ManagerPricing />} />
            </Route>

            {/* Admin governance portal: strictly restricted to System Administrators */}
            <Route element={<RequireAuth allowedRoles={ADMIN_ROLES} />}>
              <Route path="/admin-overview" element={<AdminDashboard />} />
              <Route path="/admin-facilities" element={<AdminCrudPage key="facilities" resource="facilities" />} />
              <Route path="/admin-pricing" element={<ManagerPricing />} />
              <Route path="/admin-pricing-policy" element={<ManagerPricing />} />
              <Route path="/admin-login-histories" element={<AdminLoginHistories />} />
              <Route path="/admin-audit-log" element={<AdminAuditLog />} />
              <Route path="/admin-users" element={<AdminUsers />} />
              <Route path="/admin-users/:id" element={<AdminUserDetail />} />

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

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import AuthScene from "../pages/AuthScene";
import Home from "../pages/Home";
import StorageDetail from "../pages/StorageDetail";
import Billing from "../pages/Billing";
import PaymentCheckout from "../pages/PaymentCheckout";
import ReservationDetail from "../pages/ReservationDetail";
import AccessControl from "../pages/AccessControl";
import Support from "../pages/Support";
import StaffDashboard from "../pages/StaffDashboard";
import StaffSupportTickets from "../pages/StaffSupportTickets";
import StaffMoveOuts from "../pages/StaffMoveOuts";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetail from "../pages/AdminUserDetail";
import AdminLoginHistories from "../pages/AdminLoginHistories";
import AdminAuditLog from "../pages/AdminAuditLog";
import AdminCrudPage from "../pages/AdminCrudPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import ManagerUnits from "../pages/ManagerUnits";
import ManagerTransferRequests from "../pages/ManagerTransferRequests";
import ManagerShifts from "../pages/ManagerShifts";
import ManagerChargeProposals from "../pages/ManagerChargeProposals";
import ManagerRefundApprovals from "../pages/ManagerRefundApprovals";
import ManagerAgreements from "../pages/ManagerAgreements";
import ManagerDelinquentCases from "../pages/ManagerDelinquentCases";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import AdminLayouts from "../layouts/AdminLayouts";
import ManagerLayouts from "../layouts/ManagerLayouts";
import RequireAuth from "../components/RequireAuth";
import { STAFF_ROLES, MANAGER_ROLES, ADMIN_ROLES } from "../constants/roles";

// Central route table: public guest exploration (/home) plus protected routes.
function AppRoutes() {
  const location = useLocation();

  return (
    <PageTransition>
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
            <Route path="/checkout" element={<PaymentCheckout />} />
            <Route path="/reservations/:id" element={<ReservationDetail />} />
            <Route path="/payment" element={<PaymentCheckout />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/access-control" element={<AccessControl />} />
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
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/manager-units" element={<ManagerUnits />} />
            <Route path="/manager-transfer-requests" element={<ManagerTransferRequests />} />
            <Route path="/manager-shifts" element={<ManagerShifts />} />
            <Route path="/manager-charge-proposals" element={<ManagerChargeProposals />} />
            <Route path="/manager-refund-approvals" element={<ManagerRefundApprovals />} />
            <Route path="/manager-agreements" element={<ManagerAgreements />} />
            <Route path="/manager-delinquent-cases" element={<ManagerDelinquentCases />} />
          </Route>

          {/* Admin governance portal: strictly restricted to System Administrators */}
          <Route element={<RequireAuth allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin-overview" element={<AdminDashboard />} />
            <Route path="/admin-facilities" element={<AdminCrudPage key="facilities" resource="facilities" />} />
            <Route path="/admin-login-histories" element={<AdminLoginHistories />} />
            <Route path="/admin-audit-log" element={<AdminAuditLog />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-users/:id" element={<AdminUserDetail />} />
            <Route path="/admin-tickets" element={<AdminCrudPage key="tickets" resource="tickets" />} />
            <Route path="/admin-notifications" element={<AdminCrudPage key="notifications" resource="notifications" />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default AppRoutes;

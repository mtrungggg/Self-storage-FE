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
import ManagerOperationsOverview from "../pages/ManagerOperationsOverview";
import ManagerStaffScheduling from "../pages/ManagerStaffScheduling";
import ManagerFacilityManagement from "../pages/ManagerFacilityManagement";
import ManagerTicketManagement from "../pages/ManagerTicketManagement";
import ManagerPricingPolicy from "../pages/ManagerPricingPolicy";
import ManagerContractsCustomers from "../pages/ManagerContractsCustomers";
import ManagerSecurityCenter from "../pages/ManagerSecurityCenter";
import ManagerAuditLog from "../pages/ManagerAuditLog";
import ManagerUserManagement from "../pages/ManagerUserManagement";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import ManagerLayouts from "../layouts/ManagerLayouts";
import RequireAuth from "../components/RequireAuth";

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
        <Route element={<RequireAuth />}>
          <Route element={<StaffLayouts />}>
            <Route path="/staff-dashboard" element={<StaffDashboard />} />
            <Route path="/staff-support-tickets" element={<StaffSupportTickets />} />
            <Route path="/staff-move-outs" element={<StaffMoveOuts />} />
          </Route>
        </Route>

        {/* Protected manager portal */}
        <Route element={<RequireAuth />}>
          <Route element={<ManagerLayouts />}>
            <Route path="/manager-overview" element={<ManagerOperationsOverview />} />
            <Route path="/manager-facilities" element={<ManagerFacilityManagement />} />
            <Route path="/manager-tickets" element={<ManagerTicketManagement />} />
            <Route path="/manager-contracts" element={<ManagerContractsCustomers />} />
            <Route path="/manager-staffing" element={<ManagerStaffScheduling />} />
            <Route path="/manager-pricing" element={<ManagerPricingPolicy />} />
            <Route path="/manager-system" element={<ManagerSecurityCenter />} />
            <Route path="/manager-audit-log" element={<ManagerAuditLog />} />
            <Route path="/manager-users" element={<ManagerUserManagement />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default AppRoutes;

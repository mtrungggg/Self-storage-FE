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
import AdminStaffScheduling from "../pages/AdminStaffScheduling";
import AdminPricingPolicy from "../pages/AdminPricingPolicy";
import AdminContractsCustomers from "../pages/AdminContractsCustomers";
import AdminSecurityCenter from "../pages/AdminSecurityCenter";
import AdminAuditLog from "../pages/AdminAuditLog";
import AdminCrudPage from "../pages/AdminCrudPage";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import AdminLayouts from "../layouts/AdminLayouts";
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

        {/* Protected admin portal */}
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayouts />}>
            <Route path="/admin-overview" element={<AdminDashboard />} />
            <Route path="/admin-facilities" element={<AdminCrudPage key="facilities" resource="facilities" />} />
            <Route path="/admin-contracts" element={<AdminContractsCustomers />} />
            <Route path="/admin-staffing" element={<AdminStaffScheduling />} />
            <Route path="/admin-pricing" element={<AdminPricingPolicy />} />
            <Route path="/admin-system" element={<AdminSecurityCenter />} />
            <Route path="/admin-audit-log" element={<AdminAuditLog />} />
            <Route path="/admin-users" element={<AdminCrudPage key="users" resource="users" />} />
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

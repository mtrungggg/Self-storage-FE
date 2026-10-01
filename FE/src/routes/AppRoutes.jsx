import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import FacilityDetail from '../pages/FacilityDetail';
import StorageDetail from "../pages/StorageDetail";
import Billing from "../pages/Billing";
import CustomerDashboard from "../pages/CustomerDashboard";
import RentalHandoverPage from '../pages/RentalHandoverPage';
import AccessControl from "../pages/AccessControl";
import FacilityMap from "../pages/FacilityMap";
import Support from "../pages/Support";
import StaffDashboard from "../pages/StaffDashboard";
import AdminOperationsOverview from "../pages/AdminOperationsOverview";
import AdminStaffScheduling from "../pages/AdminStaffScheduling";
import AdminFacilityManagement from "../pages/AdminFacilityManagement";
import AdminPricingPolicy from "../pages/AdminPricingPolicy";
import AdminContractsCustomers from "../pages/AdminContractsCustomers";
import AdminSecurityCenter from "../pages/AdminSecurityCenter";
import AdminAuditLog from "../pages/AdminAuditLog";
import AdminUserManagement from "../pages/AdminUserManagement";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";
import AdminLayouts from "../layouts/AdminLayouts";

// Central route table: public auth routes plus role-scoped route groups.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<CustomerLayouts />}>
        <Route path="/home" element={<Home />} />
        <Route path="/facilities/:facilityId" element={<FacilityDetail />} />
        <Route path="/storage-detail" element={<StorageDetail />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/rentals/:agreementId/handover" element={<RentalHandoverPage />} />
        <Route path="/access-control" element={<AccessControl />} />
        <Route path="/facility-map" element={<FacilityMap />} />
        <Route path="/support" element={<Support />} />
      </Route>

      <Route element={<StaffLayouts />}>
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
      </Route>

      <Route element={<AdminLayouts />}>
        <Route path="/admin-overview" element={<AdminOperationsOverview />} />
        <Route path="/admin-facilities" element={<AdminFacilityManagement />} />
        <Route path="/admin-contracts" element={<AdminContractsCustomers />} />
        <Route path="/admin-staffing" element={<AdminStaffScheduling />} />
        <Route path="/admin-pricing" element={<AdminPricingPolicy />} />
        <Route path="/admin-system" element={<AdminSecurityCenter />} />
        <Route path="/admin-audit-log" element={<AdminAuditLog />} />
        <Route path="/admin-users" element={<AdminUserManagement />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

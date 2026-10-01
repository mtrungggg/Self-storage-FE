import { Routes, Route } from "react-router-dom";
import AuthScene from "../pages/AuthScene";
import Home from "../pages/Home";
import StorageDetail from "../pages/StorageDetail";
import Billing from "../pages/Billing";
import CustomerDashboard from "../pages/CustomerDashboard";
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

// [BỔ SUNG]: Import trang Thanh toán & Xác nhận đặt chỗ (Flow 1 - Phần 5 & 6)
import ReservationCheckout from "../pages/ReservationCheckout";

// Central route table: public auth routes plus role-scoped route groups.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthScene />} />
      <Route path="/login" element={<AuthScene />} />
      <Route path="/register" element={<AuthScene />} />

      <Route element={<CustomerLayouts />}>
        <Route path="/home" element={<Home />} />
        <Route path="/storage-detail" element={<StorageDetail />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/access-control" element={<AccessControl />} />
        <Route path="/facility-map" element={<FacilityMap />} />
        <Route path="/support" element={<Support />} />
        
        {/* [BỔ SUNG ROUTE MỚI CHO FLOW 1]: Đường dẫn thanh toán và nhận mã đặt chỗ */}
        <Route path="/reservation-checkout" element={<ReservationCheckout />} />
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
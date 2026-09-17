import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import StorageDetail from "../pages/StorageDetail";
import Billing from "../pages/Billing";
import CustomerDashboard from "../pages/CustomerDashboard";
import AccessControl from "../pages/AccessControl";
import FacilityMap from "../pages/FacilityMap";
import Support from "../pages/Support";
import StaffDashboard from "../pages/StaffDashboard";
import CustomerLayouts from "../layouts/CustomerLayouts";
import StaffLayouts from "../layouts/StaffLayouts";

// Central route table: public auth routes plus role-scoped route groups.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<CustomerLayouts />}>
        <Route path="/home" element={<Home />} />
        <Route path="/storage-detail" element={<StorageDetail />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/access-control" element={<AccessControl />} />
        <Route path="/facility-map" element={<FacilityMap />} />
        <Route path="/support" element={<Support />} />
      </Route>

      <Route element={<StaffLayouts />}>
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

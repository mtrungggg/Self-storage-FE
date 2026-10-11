import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getManagerProfile,
  getActiveHub,
  getSidebarNav,
  getSidebarSectionBadge,
} from "../data/managerShellRepository";

// Application layer: wires the shared Manager console chrome (sidebar + topbar) data.
export function useManagerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fallback = getManagerProfile();

  const roles = user?.roles || [];
  let roleLabel = fallback.role;
  if (roles.includes("system_administrator") || roles.includes("admin")) {
    roleLabel = "System Administrator";
  } else if (roles.includes("business_operations_manager")) {
    roleLabel = "Business Operations Manager";
  } else if (roles.includes("facility_manager") || roles.includes("manager")) {
    roleLabel = "Facility Manager";
  } else if (roles.includes("facility_staff") || roles.includes("staff")) {
    roleLabel = "Facility Staff";
  }

  const profile = {
    name: user?.fullName || fallback.name,
    email: user?.email || fallback.email,
    role: roleLabel,
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return {
    profile,
    activeHub: getActiveHub(),
    sidebarNav: getSidebarNav(),
    sidebarSectionBadge: getSidebarSectionBadge(),
    handleLogout,
  };
}

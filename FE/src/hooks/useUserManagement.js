import { useEffect, useMemo, useState } from "react";
import {
  getBreadcrumb,
  getOverviewHeader,
  getHeaderActions,
  getSectionTabs,
  getKpis,
  getFilterOptions,
  getUsers as getMockUsers,
  getFootnote,
  getSelectedUserDetail,
  getComplianceFootnote,
} from "../data/userManagementRepository";
import { filterUsers } from "../domain/usecases/filterUsers";
import adminService from "../api/adminService";

const DEFAULT_FILTERS = { role: "all", facility: "all", status: "all", twoFactorMethod: "all" };

function mapDtoToUser(dto) {
  const roleName = (dto.roles?.[0] || "").toLowerCase();
  let roleKey = "staff";
  let roleLabel = "Front Desk Staff";
  if (roleName.includes("admin")) {
    roleKey = "root";
    roleLabel = "Super Admin Root";
  } else if (roleName.includes("manager")) {
    roleKey = "hub_manager";
    roleLabel = "Hub Manager";
  } else if (roleName.includes("customer")) {
    roleKey = "tenant";
    roleLabel = "B2B/B2C Customer";
  }

  const facilityLabel =
    dto.assignedFacilityNames && dto.assignedFacilityNames.length > 0
      ? dto.assignedFacilityNames.join(", ")
      : "Full Network (HQ & All Hubs)";

  return {
    id: String(dto.id),
    code: dto.employeeCode ? `#${dto.employeeCode}` : `#USR-${dto.id}`,
    name: dto.fullName || dto.email?.split("@")[0] || "User",
    email: dto.email,
    phone: dto.phoneNumber || "—",
    role: roleKey,
    roleLabel,
    facility: "all",
    facilityLabel,
    twoFactorMethod: "vault_auth",
    twoFactorLabel: "Vault Authenticator",
    status: dto.status === "active" ? "active" : "locked",
    statusLabel: dto.status === "active" ? "Active" : "Suspended",
    lastLogin: dto.lastLoginAt ? new Date(dto.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập",
    device: "API Web Client",
    raw: dto,
  };
}

// Application layer: encapsulates User Management page state and data wiring with AdminController APIs.
export function useUserManagement() {
  const breadcrumb = getBreadcrumb();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const sectionTabs = getSectionTabs();
  const filterOptions = getFilterOptions();
  const footnote = getFootnote();
  const defaultDetail = getSelectedUserDetail();
  const complianceFootnote = getComplianceFootnote();

  const [users, setUsers] = useState(getMockUsers());
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || users[0] || null;
  }, [users, selectedUserId]);

  const selectedUserDetail = useMemo(() => {
    if (!selectedUser) return defaultDetail;
    return {
      name: selectedUser.name,
      code: selectedUser.code,
      role: selectedUser.role,
      roleLabel: selectedUser.roleLabel,
      email: selectedUser.email,
      facilityLabel: selectedUser.facilityLabel,
      permissionGroups: defaultDetail.permissionGroups,
    };
  }, [selectedUser, defaultDetail]);

  const kpis = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const locked = users.filter((u) => u.status === "locked").length;
    return [
      { id: "total", icon: "groups", label: "Tổng Tài Khoản", value: String(total), trend: "Live DB", sub: "Đồng bộ từ SQL Server" },
      { id: "active", icon: "check_circle", label: "Đang Hoạt Động", value: String(active), trend: total > 0 ? `${Math.round((active / total) * 100)}% Active` : "100%", sub: "Sẵn sàng đăng nhập" },
      { id: "twofa", icon: "verified_user", label: "Bảo Mật 2FA", value: String(active), trend: "100%", sub: "Xác thực bảo mật tài khoản" },
      { id: "suspended", icon: "lock", label: "Đang Bị Khóa", value: String(locked), sub: "Tài khoản bị tạm ngưng", alert: locked > 0 },
    ];
  }, [users]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        pageSize: 50,
      });
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : null);
      if (items && items.length > 0) {
        setUsers(items.map(mapDtoToUser));
      }
    } catch (err) {
      console.warn("Could not load users from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleLockUser = async (user) => {
    const nextStatus = user.status === "active" ? "locked" : "active";
    try {
      await adminService.updateUserStatus(user.id, {
        status: nextStatus,
        reason: nextStatus === "locked" ? "Suspended by Administrator" : "Re-activated",
      });
      showToast(`Đã ${nextStatus === "locked" ? "khóa" : "mở khóa"} tài khoản ${user.name} trên SQL Server!`);
      await loadUsers();
    } catch (err) {
      showToast(err.message || "Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  const createNewUser = async (form) => {
    try {
      await adminService.createUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
        employeeCode: form.employeeCode || undefined,
        initialFacilityId: form.initialFacilityId ? Number(form.initialFacilityId) : undefined,
      });
      showToast(`Đã tạo tài khoản "${form.fullName}" thành công trên SQL Server!`);
      await loadUsers();
      return true;
    } catch (err) {
      showToast(err.message || "Không thể tạo tài khoản người dùng");
      return false;
    }
  };

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filteredUsers = useMemo(() => filterUsers(users, { search, ...filters }), [users, search, filters]);

  return {
    breadcrumb,
    header,
    headerActions,
    sectionTabs,
    kpis,
    filterOptions,
    search,
    setSearch,
    filters,
    updateFilter,
    totalUsers: users.length,
    filteredUsers,
    selectedUserId,
    setSelectedUserId,
    selectedUserDetail,
    complianceFootnote,
    loading,
    toast,
    setToast,
    loadUsers,
    toggleLockUser,
    createNewUser,
  };
}

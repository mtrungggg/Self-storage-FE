import { useState } from "react";
import { useUserManagement } from "../hooks/useUserManagement";

function Dropdown({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const ROLE_BADGE = {
  root: "bg-[#fdecec] text-[#c0362c]",
  hub_manager: "bg-[#eef4ff] text-[#1d5fe5]",
  ops: "bg-[#eef4ff] text-[#1d5fe5]",
  staff: "bg-[#f0f3fa] text-[#58657a]",
  iot: "bg-[#f0f3fa] text-[#58657a]",
  tenant: "bg-[#f0f3fa] text-[#58657a]",
};

const STATUS_BADGE = {
  active: "bg-[#e7f8ee] text-[#0e7b4c]",
  pending_2fa: "bg-[#fff2d8] text-[#a15c00]",
  locked: "bg-[#fdecec] text-[#c0362c]",
};

function ManagerUserManagement() {
  const {
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
    totalUsers,
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
  } = useUserManagement();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "facility_staff",
    employeeCode: "",
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      alert("Vui lòng điền đủ Họ tên, Email và Mật khẩu.");
      return;
    }
    setSubmitting(true);
    const success = await createNewUser(createForm);
    setSubmitting(false);
    if (success) {
      setCreateModalOpen(false);
      setCreateForm({
        email: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        role: "facility_staff",
        employeeCode: "",
      });
    }
  };

  return (
    <>
      {toast && (
        <div className="mb-3 flex items-center justify-between rounded-[10px] border border-[#2dd4a0] bg-[#effcf6] px-4 py-2.5 text-[12px] font-semibold text-[#0e7b4c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast("")} className="text-[11px] font-bold underline">
            Đóng
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#58657a]">
        <span>{breadcrumb.parent}</span>
        <span className="text-[#c7d1e6]">›</span>
        <span className="text-[#0b1c30]">{breadcrumb.current}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4a0]" />
            Live DB
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f5f7fd]"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            Tải lại
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3.5 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#1649b8]"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sectionTabs.map((tab) => (
          <span
            key={tab.id}
            className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-semibold ${
              tab.active ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{tab.active ? "group" : "history"}</span>
            {tab.label}
            {tab.count && <span className="rounded-full bg-white/20 px-1.5 text-[9px]">{tab.count}</span>}
            {tab.badge && <span className="rounded-full bg-white/20 px-1.5 text-[9px]">{tab.badge}</span>}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={`rounded-[12px] border p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)] ${
              kpi.alert ? "border-[#e5484d]/40 bg-[#fdf4f4]" : "border-[#dfe7f5] bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
              {kpi.label}
              <span className={`material-symbols-outlined text-[14px] ${kpi.alert ? "text-[#e5484d]" : "text-[#1d5fe5]"}`}>{kpi.icon}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-[19px] font-bold ${kpi.alert ? "text-[#c0362c]" : ""}`}>{kpi.value}</span>
              {kpi.trend && <span className="text-[10px] font-semibold text-[#0e7b4c]">{kpi.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex min-w-[220px] flex-1 items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#8996a9]">search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Name, Work Email, Phone, National ID, Employee Code (#ADM, #OPS, #STF, #TNT)..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8996a9]"
          />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dropdown label="Role &amp; Tier" value={filters.role} onChange={(v) => updateFilter("role", v)} options={filterOptions.roles} />
          <Dropdown label="Facility / Hub Access" value={filters.facility} onChange={(v) => updateFilter("facility", v)} options={filterOptions.facilities} />
          <Dropdown label="Account Status" value={filters.status} onChange={(v) => updateFilter("status", v)} options={filterOptions.statuses} />
          <Dropdown
            label="2FA Method"
            value={filters.twoFactorMethod}
            onChange={(v) => updateFilter("twoFactorMethod", v)}
            options={filterOptions.twoFactorMethods}
          />
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">
                  <input type="checkbox" className="h-3.5 w-3.5 accent-[#1d5fe5]" />
                </th>
                <th className="py-2 pr-2">Identity &amp; Code</th>
                <th className="py-2 pr-2">Role &amp; Tier</th>
                <th className="py-2 pr-2">Facility Scope</th>
                <th className="py-2 pr-2">2FA Security</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Last Login &amp; IP</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`cursor-pointer border-b border-[#f2f5fb] align-top transition hover:bg-[#f8faff] ${
                    selectedUserId === user.id ? "bg-[#eef4ff]/50" : user.flagged ? "bg-[#fdf4f4]" : ""
                  }`}
                >
                  <td className="py-2.5 pr-2">
                    <input type="checkbox" className="h-3.5 w-3.5 accent-[#1d5fe5]" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {user.name}
                      <span className="text-[9px] font-bold text-[#1d5fe5]">{user.code}</span>
                    </div>
                    <div className="text-[9px] text-[#8996a9]">{user.email}</div>
                    <div className="text-[9px] text-[#8996a9]">{user.phone}</div>
                  </td>
                  <td className="py-2.5 pr-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${ROLE_BADGE[user.role]}`}>{user.roleLabel}</span>
                  </td>
                  <td className="py-2.5 pr-2 text-[#58657a]">
                    <div className="font-semibold text-[#3a475a]">{user.facilityLabel}</div>
                  </td>
                  <td className="py-2.5 pr-2 text-[#58657a]">{user.twoFactorLabel}</td>
                  <td className="py-2.5 pr-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[user.status]}`}>{user.statusLabel}</span>
                  </td>
                  <td className="py-2.5 pr-2 text-[#58657a]">
                    <div>{user.lastLogin}</div>
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5 text-[#8996a9]">
                      <span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-[#1d5fe5]">edit</span>
                      <button
                        onClick={() => toggleLockUser(user)}
                        title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        className="text-[#8996a9] hover:text-[#c0362c]"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {user.status === "active" ? "lock" : "lock_open"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[11px] text-[#8996a9]">
                    No users match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
          <span>{footnote} • Records: {filteredUsers.length}/{totalUsers}</span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">
              <span className="material-symbols-outlined text-[13px]">chevron_left</span>
            </button>
            <span className="rounded-[6px] bg-[#0b1c30] px-2 py-1 text-white">1</span>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">2</button>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">3</button>
            <span className="px-1">...</span>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">385</button>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[13px] font-bold text-[#1d5fe5]">
              {selectedUserDetail.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold">
                {selectedUserDetail.name}
                <span className="text-[9px] font-bold text-[#8996a9]">{selectedUserDetail.code}</span>
                <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[9px] font-bold text-[#c0362c]">{selectedUserDetail.roleLabel}</span>
              </div>
              <div className="text-[9px] text-[#8996a9]">{selectedUserDetail.email} • {selectedUserDetail.facilityLabel}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-[8px] border border-[#dfe7f5] px-3 py-1.5 text-[10px] font-semibold text-[#3a475a]">View Login History</button>
            <button className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white">Edit Permissions</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {selectedUserDetail.permissionGroups.map((group) => (
            <div key={group.id} className="rounded-[10px] border border-[#eef1f8] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">{group.title}</span>
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[8px] font-bold text-[#1d5fe5]">{group.tag}</span>
              </div>
              <div className="mt-1.5 space-y-1">
                {group.items.map((item) => (
                  <div key={item} className="flex items-start gap-1.5 text-[9px] text-[#3a475a]">
                    <span className="material-symbols-outlined mt-0.5 text-[12px] text-[#0e7b4c]">check_circle</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f8] pt-2 text-[9px] text-[#8996a9]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#0e7b4c]">verified</span>
            {complianceFootnote.left}
          </span>
          <span>{complianceFootnote.right}</span>
        </div>
      </div>

      {/* Modal: Add New Internal User (POST /api/admin/users) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <div>
                <h3 className="text-[15px] font-bold">Thêm Người Dùng Mới</h3>
                <p className="text-[10px] text-[#8996a9]">Tạo tài khoản và lưu trực tiếp vào cơ sở dữ liệu qua API Admin</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#8996a9] hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-[11px]">
              <div>
                <label className="font-bold text-[#3a475a]">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Văn Bảo"
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="staff@vaultspace.vn"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Số điện thoại</label>
                  <input
                    type="text"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                    placeholder="0901234567"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#3a475a]">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3a475a]">Mã nhân viên (nếu có)</label>
                  <input
                    type="text"
                    value={createForm.employeeCode}
                    onChange={(e) => setCreateForm({ ...createForm, employeeCode: e.target.value })}
                    placeholder="VD: STF-102"
                    className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3a475a]">Vai trò hệ thống *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 outline-none"
                >
                  <option value="facility_staff">Facility Staff (Nhân viên vận hành kho)</option>
                  <option value="facility_manager">Facility Manager (Quản lý cơ sở)</option>
                  <option value="system_administrator">System Administrator (Quản trị viên)</option>
                  <option value="customer">Customer (Khách hàng)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[8px] bg-[#1d5fe5] px-4 py-2 font-bold text-white hover:bg-[#1649b8] disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerUserManagement;

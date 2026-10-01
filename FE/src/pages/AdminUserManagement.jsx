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

function AdminUserManagement() {
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
    footnote,
    selectedUserDetail,
    complianceFootnote,
  } = useUserManagement();

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#58657a]">
        <span>{breadcrumb.parent}</span>
        <span className="text-[#c7d1e6]">›</span>
        <span className="text-[#0b1c30]">{breadcrumb.current}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <p className="mt-1 max-w-[600px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "new_user" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
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
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
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
                <tr key={user.id} className={`border-b border-[#f2f5fb] align-top ${user.flagged ? "bg-[#fdf4f4]" : ""}`}>
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
                    <div className="text-[9px] text-[#8996a9]">{user.facilityNote}</div>
                  </td>
                  <td className="py-2.5 pr-2 text-[#58657a]">{user.twoFactorLabel}</td>
                  <td className="py-2.5 pr-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[user.status]}`}>{user.statusLabel}</span>
                  </td>
                  <td className="py-2.5 pr-2 text-[#58657a]">
                    <div>{user.lastLogin}</div>
                    <div className="text-[9px] text-[#8996a9]">{user.device}</div>
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5 text-[#8996a9]">
                      <span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-[#1d5fe5]">edit</span>
                      <span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-red-600">lock</span>
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
    </>
  );
}

export default AdminUserManagement;

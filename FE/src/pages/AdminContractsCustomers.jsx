import { useContracts } from "../hooks/useContracts";

function Dropdown({ value, onChange, options }) {
  return (
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
  );
}

const VALIDITY_ROW_STYLE = {
  active: "border-l-transparent",
  renewal: "border-l-[#f5a524] bg-[#fffaf0]",
  locked: "border-l-[#e5484d] bg-[#fdf4f4]",
};

const ACTIVITY_ICON = { success: "check_circle", failed: "cancel" };
const ACTIVITY_ICON_COLOR = { success: "text-[#0e7b4c]", failed: "text-[#c0362c]" };

function AdminContractsCustomers() {
  const {
    statusBanner,
    header,
    headerActions,
    kpis,
    filterOptions,
    search,
    setSearch,
    filters,
    updateFilter,
    contractLegend,
    totalContracts,
    filteredContracts,
    contractFootnote,
    emergencyActions,
    iotStatusNote,
    activityLog,
    complianceInfo,
  } = useContracts();

  return (
    <>
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1d5fe5]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1d5fe5]" />
        {statusBanner.label}
        <span className="font-semibold normal-case text-[#8996a9]">• {statusBanner.detail}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[20px] font-bold">{header.title}</h1>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "new_contract" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
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
              <span className={`material-symbols-outlined text-[14px] ${kpi.alert ? "text-[#e5484d]" : "text-[#1d5fe5]"}`}>
                {kpi.icon}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-[19px] font-bold ${kpi.alert ? "text-[#c0362c]" : ""}`}>{kpi.value}</span>
              {kpi.trend && <span className="text-[10px] font-semibold text-[#0e7b4c]">{kpi.trend}</span>}
            </div>
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white p-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#8996a9]">search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Contract ID, Customer Name..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8996a9]"
          />
        </div>
        <Dropdown value={filters.audience} onChange={(v) => updateFilter("audience", v)} options={filterOptions.audiences} />
        <Dropdown value={filters.cycle} onChange={(v) => updateFilter("cycle", v)} options={filterOptions.cycles} />
        <Dropdown value={filters.validity} onChange={(v) => updateFilter("validity", v)} options={filterOptions.validity} />
        <span className="material-symbols-outlined text-[16px] text-[#8996a9]">refresh</span>
      </div>

      <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold">Managed Storage Lease Contracts</span>
            <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-[#1d5fe5]">{filteredContracts.length} records</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-[#58657a]">
            {contractLegend.map((item) => (
              <span key={item.id} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Contract ID</th>
                <th className="py-2 pr-2">Customer &amp; Entity</th>
                <th className="py-2 pr-2">Unit &amp; Hub</th>
                <th className="py-2 pr-2">Term &amp; Alerts</th>
                <th className="py-2 pr-2">Value &amp; Billing Cycle</th>
                <th className="py-2 pr-2">Security Deposit</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className={`border-b border-l-2 border-[#f2f5fb] ${VALIDITY_ROW_STYLE[contract.validity]}`}>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-bold text-[#1d5fe5]">{contract.id}</div>
                    <div className="text-[9px] text-[#8996a9]">{contract.signMethod}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {contract.customer}
                      <span className="rounded-full bg-[#eef4ff] px-1.5 py-0.5 text-[8px] font-bold text-[#1d5fe5]">
                        {contract.audience === "b2b" ? "B2B" : "Individual B2C"}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#8996a9]">{contract.contact}</div>
                    <div className="text-[9px] text-[#8996a9]">{contract.taxOrEmail}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-semibold">{contract.unit}</div>
                    <div className="text-[9px] text-[#8996a9]">{contract.unitNote}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="text-[#3a475a]">{contract.term}</div>
                    <div className="font-bold text-[#1d5fe5]">{contract.daysLeft}</div>
                    <div className="text-[9px] text-[#8996a9]">{contract.alertNote}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-bold">{contract.value}</div>
                    <div className="text-[9px] text-[#8996a9]">Total: {contract.totalValue}</div>
                    <div className="text-[9px] text-[#8996a9]">{contract.cycleNote}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-[#0e7b4c]">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      {contract.depositStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[11px] text-[#8996a9]">
                    No matching contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
          <span>
            Showing 1-{filteredContracts.length} of {totalContracts} contracts • {contractFootnote.totalDeposit}
          </span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">Previous</button>
            <span className="rounded-[6px] bg-[#0b1c30] px-2 py-1 text-white">1</span>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">2</button>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">3</button>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">Next</button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#f5a524]">bolt</span>
            Automated &amp; Emergency Tasks
          </div>
          <p className="mt-1 text-[10px] text-[#8996a9]">Debt enforcement and lock override via VaultSpace IoT Latch protocol.</p>

          <div className="mt-3 space-y-2">
            {emergencyActions.map((action) => (
              <button
                key={action.id}
                className="flex w-full items-center justify-between rounded-[8px] border border-[#dfe7f5] px-3 py-2 text-[10px] font-semibold text-[#3a475a]"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">{action.icon}</span>
                  {action.label}
                </span>
                <span className="material-symbols-outlined text-[14px] text-[#8996a9]">chevron_right</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[9px] text-[#8996a9]">
            <span>Connection Protocol: {iotStatusNote}</span>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#2dd4a0]" />
            Recent Lease Activity Log
          </div>

          <div className="mt-3 space-y-2.5">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 rounded-[8px] bg-[#f8faff] p-2.5 text-[10px]">
                <span className={`material-symbols-outlined mt-0.5 text-[14px] ${ACTIVITY_ICON_COLOR[log.type]}`}>{ACTIVITY_ICON[log.type]}</span>
                <div>
                  <div className="font-semibold">{log.title}</div>
                  <div className="text-[9px] text-[#8996a9]">{log.detail}</div>
                  <div className="text-[9px] text-[#8996a9]">{log.time} • {log.actor}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-[#eef1f8] pt-2 text-[10px] font-bold text-[#1d5fe5] cursor-pointer hover:underline">View all 148 activities today</div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">{complianceInfo.badge}</span>
          <div className="mt-1.5 text-[13px] font-bold">{complianceInfo.title}</div>
          <p className="mt-1 text-[10px] text-[#8996a9]">{complianceInfo.note}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {complianceInfo.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#0b1c30] px-2 py-0.5 text-[9px] font-bold text-white">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-3 border-t border-[#eef1f8] pt-2 text-[10px] font-bold text-[#1d5fe5] cursor-pointer hover:underline">Download Contract Template</div>
        </div>
      </div>
    </>
  );
}

export default AdminContractsCustomers;

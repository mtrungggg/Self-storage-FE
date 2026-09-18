import { useAuditLog } from "../hooks/useAuditLog";

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

function AdminAuditLog() {
  const {
    breadcrumb,
    header,
    headerActions,
    sectionTabs,
    kpis,
    filterOptions,
    quickFilters,
    search,
    setSearch,
    filters,
    updateFilter,
    applyQuickFilter,
    filteredEvents,
    totalEvents,
    auditFootnote,
    complianceCards,
  } = useAuditLog();

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-[#58657a]">
        <span>{breadcrumb.parent}</span>
        <span className="text-[#c7d1e6]">›</span>
        <span className="text-[#0b1c30]">{breadcrumb.current}</span>
        <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-[#0e7b4c]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" /> {breadcrumb.siemStatus}
        </span>
        <span className="text-[9px] text-[#8996a9]">{breadcrumb.ledgerHash}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <p className="mt-1 max-w-[600px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "export"
                  ? "bg-[#1d5fe5] text-white"
                  : action.id === "live"
                  ? "border border-[#e5484d]/40 bg-[#fdf4f4] text-[#c0362c]"
                  : "border border-[#dfe7f5] text-[#3a475a]"
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
            <span className="material-symbols-outlined text-[14px]">{tab.active ? "history" : "group"}</span>
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
            <div className={`mt-1 text-[17px] font-bold ${kpi.alert ? "text-[#c0362c]" : ""}`}>{kpi.value}</div>
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown value="today" onChange={() => {}} options={filterOptions.timeRanges} />
          <Dropdown value={filters.category} onChange={(v) => updateFilter("category", v)} options={filterOptions.categories} />
          <Dropdown value={filters.status} onChange={(v) => updateFilter("status", v)} options={filterOptions.statuses} />
          <Dropdown value={filters.actorType} onChange={(v) => updateFilter("actorType", v)} options={filterOptions.actors} />
        </div>

        <div className="mt-2 flex min-w-[220px] flex-1 items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#8996a9]">search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo IP, mã kho #B-204, hợp đồng #CTR..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8996a9]"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase text-[#8996a9]">Bộ lọc nhanh:</span>
          {quickFilters.map((chip) => (
            <button
              key={chip.id}
              onClick={() => applyQuickFilter(chip.value)}
              className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold text-[#1d5fe5]"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Thời gian (UTC+7)</th>
                <th className="py-2 pr-2">Người thực hiện / Tác nhân</th>
                <th className="py-2 pr-2">Danh mục</th>
                <th className="py-2 pr-2">Hành động & Dữ liệu Payload</th>
                <th className="py-2 pr-2">IP nguồn & Thiết bị</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className={`border-b border-[#f2f5fb] ${event.status === "blocked" ? "bg-[#fdf4f4]" : ""}`}>
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-semibold">{event.time}</div>
                    <div className="text-[9px] text-[#8996a9]">{event.date}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top">
                    <div className={`font-semibold ${event.actorType === "unknown" ? "text-[#c0362c]" : ""}`}>{event.actor}</div>
                    <div className="text-[9px] text-[#8996a9]">{event.actorRole}</div>
                  </td>
                  <td className="py-2.5 pr-2 align-top text-[#58657a]">{event.categoryLabel}</td>
                  <td className="py-2.5 pr-2 align-top text-[#3a475a]">{event.action}</td>
                  <td className="py-2.5 pr-2 align-top text-[#58657a]">
                    <div>{event.ip}</div>
                    <div className="text-[9px] text-[#8996a9]">{event.device}</div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[11px] text-[#8996a9]">
                    Không có sự kiện nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
          <span>{auditFootnote} ({filteredEvents.length}/{totalEvents} hiển thị)</span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">Trước</button>
            <span className="rounded-[6px] bg-[#0b1c30] px-2 py-1 text-white">1</span>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">2</button>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">3</button>
            <span className="px-1">...</span>
            <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">947</button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {complianceCards.map((card) => (
          <div key={card.id} className="flex items-center justify-between rounded-[12px] border border-[#dfe7f5] bg-white p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef4ff] text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[17px]">{card.icon}</span>
              </span>
              <div>
                <div className="text-[11px] font-bold">{card.title}</div>
                <div className="text-[9px] text-[#8996a9]">{card.detail}</div>
              </div>
            </div>
            <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[9px] font-bold text-[#0e7b4c]">{card.statusLabel}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default AdminAuditLog;

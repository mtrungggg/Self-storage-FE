import { useOperationsOverview } from "../hooks/useOperationsOverview";

const UNIT_STATUS_STYLES = {
  available: "border-[#2dd4a0] bg-[#effcf6]",
  occupied: "border-[#dfe7f5] bg-white",
  alert: "border-[#e5484d] bg-[#fdecec]",
};

const VOUCHER_STATUS_BADGE = {
  active: "bg-[#e7f8ee] text-[#0e7b4c]",
  hub_only: "border border-[#dfe7f5] text-[#58657a]",
};

function AdminOperationsOverview() {
  const {
    liveBanner,
    header,
    actions,
    kpis,
    revenueTrend,
    revenueMaxValue,
    revenueTrendPath,
    revenueTargetY,
    chartWidth,
    chartHeight,
    revenueMix,
    floorFilters,
    activeFloor,
    setActiveFloor,
    statusTabCounts,
    activeStatusTab,
    setActiveStatusTab,
    floorZoneLabel,
    filteredUnits,
    selectedUnitId,
    setSelectedUnitId,
    selectedUnit,
    floorFootnote,
    policy,
    updatePolicy,
    vouchers,
  } = useOperationsOverview();

  return (
    <>
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1d5fe5]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1d5fe5]" />
        {liveBanner.label}
        <span className="font-semibold normal-case text-[#8996a9]">• {liveBanner.detail}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">{header.title}</h1>
          <p className="mt-1 max-w-[560px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "add" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
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
          <div key={kpi.id} className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
              {kpi.label}
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">{kpi.icon}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[19px] font-bold">{kpi.value}</span>
              <span className="text-[10px] font-semibold text-[#0e7b4c]">{kpi.trend}</span>
            </div>
            <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[14px] font-bold">6-Month MRR Revenue Trend</div>
              <p className="text-[10px] text-[#8996a9]">Compare Hub #04 with other Hubs vs {revenueTrend.target}B target</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-[#1d5fe5]" /> Hub #04</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[3px] bg-[#c7d1e6]" /> Other Hubs</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t-2 border-dashed border-[#8996a9]" /> Target</span>
            </div>
          </div>

          <div className="relative mt-4" style={{ height: chartHeight }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <line x1="0" y1={revenueTargetY} x2={chartWidth} y2={revenueTargetY} stroke="#8996a9" strokeWidth="1.5" strokeDasharray="5 5" />
              <path d={revenueTrendPath} fill="none" stroke="#0e7b4c" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">
              {revenueTrend.months.map((month, index) => {
                const hub04Height = (revenueTrend.hub04[index] / revenueMaxValue) * chartHeight;
                const otherHeight = (revenueTrend.otherHubs[index] / revenueMaxValue) * chartHeight;
                return (
                  <div key={month} className="flex flex-1 flex-col items-center justify-end">
                    <div className="flex w-6 flex-col-reverse overflow-hidden rounded-t-[3px]">
                      <div className="w-full bg-[#1d5fe5]" style={{ height: hub04Height }} />
                      <div className="w-full bg-[#c7d1e6]" style={{ height: otherHeight }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[9px] font-semibold text-[#8996a9]">
            {revenueTrend.months.map((month) => (
              <span key={month} className="flex-1 text-center">{month}</span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f8] pt-3 text-[10px] font-semibold">
            <span className="text-[#0e7b4c]">{revenueTrend.growthLabel}</span>
            <span className="text-[#c0362c]">{revenueTrend.gapLabel}</span>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="text-[14px] font-bold">Revenue Mix by Storage Category</div>
          <p className="text-[10px] text-[#8996a9]">Yield performance across unit types</p>

          <div className="mt-3 rounded-[10px] bg-[#effcf6] p-3">
            <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#0e7b4c]">{revenueMix.yield.label}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[15px] font-bold">{revenueMix.yield.value}</span>
              <span className="text-[10px] font-semibold text-[#0e7b4c]">{revenueMix.yield.trend}</span>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {revenueMix.categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#3a475a]">
                  <span>{category.label}</span>
                  <span>{category.pct}% • {category.amount}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-[#f0f3fa]">
                  <div className="h-1.5 rounded-full bg-[#1d5fe5]" style={{ width: `${category.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-[8px] border border-dashed border-[#dfe7f5] p-2 text-[10px] text-[#58657a]">
            {revenueMix.recommendation}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[14px] font-bold">Facility Floor Map &amp; Real-time Dispatch</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[10px] font-semibold text-[#58657a]">
              {floorFilters.sizes[0].label}
            </span>
            <div className="inline-flex rounded-[8px] bg-[#eef4ff] p-0.5">
              {floorFilters.floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`rounded-[6px] px-2.5 py-1 text-[10px] font-semibold transition ${
                    activeFloor === floor.id ? "bg-[#0b1c30] text-white" : "text-[#58657a]"
                  }`}
                >
                  {floor.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {statusTabCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                activeStatusTab === tab.id ? "bg-[#0b1c30] text-white" : "bg-[#f5f7fd] text-[#58657a]"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">{floorZoneLabel}</div>

        <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {filteredUnits.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
              No units match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {filteredUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`rounded-[10px] border p-2.5 text-left ${UNIT_STATUS_STYLES[unit.status]} ${
                    selectedUnitId === unit.id ? "ring-2 ring-[#1d5fe5]" : ""
                  }`}
                >
                  <div className="text-[11px] font-bold">#{unit.id}</div>
                  <div className="truncate text-[9px] font-semibold text-[#58657a]">{unit.occupant}</div>
                  <div className="text-[9px] text-[#8996a9]">{unit.size} • {unit.price}</div>
                </button>
              ))}
            </div>
          )}

          {selectedUnit ? (
            <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-bold">Unit {selectedUnit.unit}</div>
                <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[9px] font-bold text-[#0e7b4c]">
                  {selectedUnit.operationalStatus}
                </span>
              </div>
              <div className="text-[10px] text-[#8996a9]">{selectedUnit.sizeLabel}</div>

              <div className="mt-2 border-t border-[#eef1f8] pt-2 text-[10px] text-[#3a475a]">
                <div className="font-bold uppercase tracking-[0.04em] text-[#8996a9]">Current Tenant</div>
                <div className="mt-1 font-semibold">{selectedUnit.tenant} • {selectedUnit.contract}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[#8996a9]">Term</span>
                  <span className="font-semibold">{selectedUnit.term}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8996a9]">Billing Status</span>
                  <span className="font-semibold text-[#0e7b4c]">{selectedUnit.paidThrough}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[11px]">
                <span className="text-[#8996a9]">Listed Rate</span>
                <span className="font-bold">{selectedUnit.price}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[#3a475a]">
                <span>{selectedUnit.sensor}</span>
                <span className="font-semibold">Latch: {selectedUnit.lockStatus}</span>
              </div>

              <select
                defaultValue={selectedUnit.statusOption}
                className="mt-2 w-full rounded-[8px] border border-[#dfe7f5] bg-white px-2 py-1.5 text-[10px] font-semibold text-[#3a475a]"
              >
                <option>{selectedUnit.statusOption}</option>
              </select>

              <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white">
                <span className="material-symbols-outlined text-[14px]">group_add</span>
                Assign Unit to New Customer
              </button>
            </div>
          ) : (
            <div className="rounded-[12px] border border-dashed border-[#dfe7f5] p-4 text-center text-[10px] text-[#8996a9]">
              Select a unit to view details.
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f8] pt-2 text-[10px] text-[#8996a9]">
          <span>{floorFootnote.shown}</span>
          <span>{floorFootnote.breakdown}</span>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[14px] font-bold">Policy Configuration, Security Deposit &amp; Promotions</div>
          <div className="flex gap-2">
            <button className="rounded-[8px] border border-[#dfe7f5] px-3 py-1.5 text-[10px] font-semibold text-[#3a475a]">
              Reset to Default
            </button>
            <button className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white">Save Changes</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[10px] border border-[#eef1f8] p-3">
            <div className="text-[11px] font-bold">Security Deposit</div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">Escrow deposit protecting assets and smart lock hardware</p>
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={policy.depositPercent}
                onChange={(event) => updatePolicy("depositPercent", event.target.value)}
                className="w-16 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px] font-semibold"
              />
              <span className="text-[10px] text-[#8996a9]">% of 1 month rental</span>
            </div>
            <label className="mt-2 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={policy.exemptB2B}
                onChange={(event) => updatePolicy("exemptB2B", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Exempt deposit for B2B contracts prepaid ≥ 12 months
            </label>
          </div>

          <div className="rounded-[10px] border border-[#eef1f8] p-3">
            <div className="text-[11px] font-bold">Late Penalty &amp; Lockout</div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">Automated enforcement on delinquent accounts</p>
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={policy.penaltyPercent}
                onChange={(event) => updatePolicy("penaltyPercent", event.target.value)}
                className="w-16 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px] font-semibold"
              />
              <span className="text-[10px] text-[#8996a9]">% after 5 days past due</span>
            </div>
            <label className="mt-2 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="checkbox"
                checked={policy.autoLockEnabled}
                onChange={(event) => updatePolicy("autoLockEnabled", event.target.checked)}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Auto-lock PIN &amp; Latch after 7 days past due
            </label>
          </div>

          <div className="rounded-[10px] border border-[#eef1f8] p-3">
            <div className="text-[11px] font-bold">Cancellation &amp; Refund Policy</div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">Refund rules when customer books reservation in advance</p>
            <label className="mt-2 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="radio"
                name="cancellation"
                checked={policy.cancellationPolicy === "flexible"}
                onChange={() => updatePolicy("cancellationPolicy", "flexible")}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Flexible cancellation (&gt;48h): 100% hold fee refund
            </label>
            <label className="mt-1.5 flex items-start gap-1.5 text-[9px] text-[#3a475a]">
              <input
                type="radio"
                name="cancellation"
                checked={policy.cancellationPolicy === "late"}
                onChange={() => updatePolicy("cancellationPolicy", "late")}
                className="mt-0.5 h-3 w-3 accent-[#1d5fe5]"
              />
              Late cancellation (&lt;48h): forfeit 20% deposit
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[14px] font-bold">Manage Coupons &amp; Vouchers</div>
          <button className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white">
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add Promo Code
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="rounded-[10px] border border-[#eef1f8] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1d5fe5]">{voucher.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${VOUCHER_STATUS_BADGE[voucher.status]}`}>
                  {voucher.statusLabel}
                </span>
              </div>
              <div className="mt-1 text-[10px] text-[#3a475a]">{voucher.description}</div>

              {voucher.total ? (
                <>
                  <div className="mt-2 h-1.5 rounded-full bg-[#f0f3fa]">
                    <div
                      className="h-1.5 rounded-full bg-[#1d5fe5]"
                      style={{ width: `${(voucher.used / voucher.total) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[9px] text-[#8996a9]">{voucher.used}/{voucher.total} redemptions</div>
                </>
              ) : (
                <div className="mt-2 text-[9px] text-[#8996a9]">{voucher.used} redemptions (unlimited)</div>
              )}

              <div className="mt-1 flex items-center justify-between text-[9px]">
                <span className="text-[#8996a9]">{voucher.note}</span>
                <span className="font-bold text-[#1d5fe5]">{voucher.actionLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminOperationsOverview;

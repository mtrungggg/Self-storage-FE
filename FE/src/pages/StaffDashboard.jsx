import { useStaffDashboard } from "../hooks/useStaffDashboard";
import PageBackground from "../components/PageBackground";

const STATUS_STYLES = {
  available: "border-[#2dd4a0] bg-[#effcf6]",
  occupied: "border-[#dfe7f5] bg-white",
  handover: "border-[#f5a524] bg-[#fff8ec] ring-2 ring-[#f5a524]/30",
  alert: "border-[#e5484d] bg-[#fdecec]",
};

function StaffDashboard() {
  const {
    profile,
    navTabs,
    activeNavTab,
    setActiveNavTab,
    currentTime,
    kpis,
    zones,
    activeZone,
    setActiveZone,
    floors,
    activeFloor,
    setActiveFloor,
    filteredUnits,
    legendWithCounts,
    handover,
    checkedItems,
    toggleChecklistItem,
    scheduleTabs,
    activeScheduleTab,
    setActiveScheduleTab,
    filteredSchedule,
  } = useStaffDashboard();

  return (
    <div className="relative min-h-screen text-[#0b1c30]">
      <PageBackground />
      <header className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1d5fe5] text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">warehouse</span>
            </div>
            <span className="hidden text-[16px] tracking-tight sm:block">
              <span className="font-black text-[#0a3d91]">G1</span>
              <span className="font-bold text-[#0b1c30]">SelfStorage</span>
            </span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveNavTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-semibold transition ${
                  activeNavTab === tab.id ? "bg-[#eef4ff] text-[#1d5fe5]" : "text-[#58657a] hover:bg-[#f5f7fd]"
                }`}
              >
                {tab.label}
                {tab.count ? (
                  <span className="rounded-full bg-[#0b1c30] px-1.5 py-0.5 text-[9px] text-white">{tab.count}</span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] font-semibold tabular-nums text-[#8996a9] md:block">{currentTime}</span>
            <button className="hidden items-center gap-1.5 rounded-[8px] bg-[#0b1c30] px-3 py-1.5 text-[11px] font-bold text-white md:flex">
              <span className="material-symbols-outlined text-[14px]">sync_alt</span>
              Shift Handover
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="hidden leading-tight lg:block">
                <div className="text-[11px] font-bold">{profile.name}</div>
                <div className="text-[9px] text-[#8996a9]">{profile.code} • {profile.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 py-5 lg:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                {kpi.label}
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">{kpi.icon}</span>
              </div>
              <div className="mt-1 text-[20px] font-bold">{kpi.value}</div>
              <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[14px] font-bold">Floor Map</div>
              <div className="inline-flex rounded-[8px] bg-[#eef4ff] p-0.5">
                {floors.map((floor) => (
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

            <div className="mt-3 flex flex-wrap gap-1.5">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                    activeZone === zone.id ? "bg-[#0b1c30] text-white" : "bg-[#f5f7fd] text-[#58657a]"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-3 border-b border-[#eef1f8] pb-3 text-[10px] font-semibold text-[#58657a]">
              {legendWithCounts.map((item) => (
                <span key={item.id} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label} ({item.count})
                </span>
              ))}
            </div>

            {filteredUnits.length === 0 ? (
              <div className="mt-3 rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
                No units in this zone.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {filteredUnits.map((unit) => (
                  <div key={unit.id} className={`rounded-[10px] border p-2.5 ${STATUS_STYLES[unit.status]}`}>
                    <div className="text-[11px] font-bold">{unit.id}</div>
                    <div className="text-[9px] text-[#8996a9]">{unit.size}</div>
                    <div className="mt-1 truncate text-[9px] font-semibold text-[#58657a]">{unit.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[16px] border border-[#f5a524]/40 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#fff2d8] px-2 py-0.5 text-[9px] font-bold text-[#a15c00]">Pending Handover</span>
              <span className="text-[10px] font-semibold text-[#8996a9]">{handover.code}</span>
            </div>
            <div className="mt-2 text-[15px] font-bold">Unit {handover.unit}</div>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-bold">
                {handover.customer}
                <span className="material-symbols-outlined text-[13px] text-[#1d5fe5]">verified</span>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-[#3a475a]">
              <div className="flex items-center justify-between">
                <span className="text-[#8996a9]">Dimensions</span>
                <span className="font-semibold">{handover.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8996a9]">Deposit &amp; Payment</span>
                <span className="font-semibold">{handover.deposit} · {handover.payment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8996a9]">Activation PIN</span>
                <span className="font-semibold">{handover.pin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8996a9]">Lock Battery</span>
                <span className="font-semibold">{handover.battery}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-[#eef1f8] pt-3">
              {handover.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-[11px] text-[#3a475a]">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-3.5 w-3.5 accent-[#1d5fe5]"
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <button className="flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white">
                <span className="material-symbols-outlined text-[14px]">nfc</span>
                Issue NFC Card &amp; Send OTP
              </button>
              <button className="flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#0e7b4c] py-2 text-[11px] font-bold text-white">
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                Confirm Handover &amp; Sign Off
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-[8px] border border-[#dfe7f5] py-1.5 text-[10px] font-semibold text-[#3a475a]">Report Issue</button>
                <button className="rounded-[8px] border border-[#dfe7f5] py-1.5 text-[10px] font-semibold text-[#3a475a]">Save Draft</button>
              </div>
            </div>

            <div className="mt-3 border-t border-[#eef1f8] pt-2 text-[10px] text-[#8996a9]">{handover.handoffNote}</div>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[14px] font-bold">Move-in &amp; Move-out Schedule</div>
            <div className="inline-flex rounded-[8px] bg-[#eef4ff] p-0.5">
              {scheduleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScheduleTab(tab.id)}
                  className={`flex items-center gap-1 rounded-[6px] px-2.5 py-1.5 text-[10px] font-semibold transition ${
                    activeScheduleTab === tab.id ? "bg-[#0b1c30] text-white" : "text-[#58657a]"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {filteredSchedule.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[11px] font-bold text-[#1d5fe5]">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold">
                      {item.name}
                      <span className="text-[9px] font-semibold text-[#1d5fe5]">#{item.id}</span>
                    </div>
                    <div className="text-[10px] text-[#8996a9]">{item.unit} • {item.status}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-[#58657a]">{item.time}</span>
                  <button className="rounded-[8px] bg-[#0b1c30] px-3 py-1.5 text-[10px] font-bold text-white">{item.action}</button>
                </div>
              </div>
            ))}
            {filteredSchedule.length === 0 && (
              <div className="rounded-[10px] border border-dashed border-[#dfe7f5] p-6 text-center text-[11px] text-[#8996a9]">
                No schedule tasks in this category.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffDashboard;

import { useFacilityManagement } from "../hooks/useFacilityManagement";

const STATUS_NOTE_STYLE = {
  available: "text-[#0e7b4c]",
  pending: "text-[#1d5fe5]",
  alert: "text-[#c0362c] font-bold",
};

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

function AdminFacilityManagement() {
  const {
    statusBanner,
    header,
    headerActions,
    kpis,
    filterOptions,
    filters,
    updateFilter,
    resetFilters,
    totalUnits,
    filteredUnits,
    selectedUnitId,
    setSelectedUnitId,
    selectedUnit,
  } = useFacilityManagement();

  return (
    <>
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1d5fe5]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1d5fe5]" />
        {statusBanner.label}
        <span className="font-semibold normal-case text-[#8996a9]">• {statusBanner.detail}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
            <span className="material-symbols-outlined text-[18px]">home</span>
          </span>
          <h1 className="text-[18px] font-bold">{header.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold ${
                action.id === "new_unit" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
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
            {kpi.sub && <div className="mt-0.5 truncate text-[10px] text-[#8996a9]">{kpi.sub}</div>}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-bold">Bộ lọc thuộc tính kho</div>
          <button onClick={resetFilters} className="flex items-center gap-1 text-[10px] font-bold text-[#1d5fe5]">
            <span className="material-symbols-outlined text-[13px]">filter_alt_off</span>
            Xóa tất cả bộ lọc
          </button>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dropdown label="Tầng cơ sở" value={filters.floor} onChange={(v) => updateFilter("floor", v)} options={filterOptions.floors} />
          <Dropdown label="Phân khu chức năng" value={filters.zone} onChange={(v) => updateFilter("zone", v)} options={filterOptions.zones} />
          <Dropdown label="Kích thước quy chuẩn" value={filters.size} onChange={(v) => updateFilter("size", v)} options={filterOptions.sizes} />
          <Dropdown label="Tình trạng vận hành" value={filters.status} onChange={(v) => updateFilter("status", v)} options={filterOptions.statuses} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold">Danh sách Căn kho chi tiết</span>
              <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                {filteredUnits.length} bản ghi
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#8996a9]">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span className="material-symbols-outlined text-[16px]">download</span>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                  <th className="py-2 pr-2">Mã kho</th>
                  <th className="py-2 pr-2">Loại & Kích thước</th>
                  <th className="py-2 pr-2">Tầng / Phân khu</th>
                  <th className="py-2 pr-2">Khách thuê / Trạng thái</th>
                  <th className="py-2 pr-2">Giá niêm yết</th>
                  <th className="py-2 pr-2">IoT vi khí hậu</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`cursor-pointer border-b border-[#f2f5fb] border-l-2 ${
                      unit.id === selectedUnitId
                        ? "border-l-[#1d5fe5] bg-[#eef4ff]/40"
                        : unit.status === "alert"
                        ? "border-l-[#e5484d] bg-[#fdf4f4]"
                        : "border-l-transparent"
                    }`}
                  >
                    <td className="py-2.5 pr-2 font-bold text-[#1d5fe5]">#{unit.id}</td>
                    <td className="py-2.5 pr-2 text-[#3a475a]">{unit.sizeLabel}</td>
                    <td className="py-2.5 pr-2 text-[#58657a]">{unit.locationLabel}</td>
                    <td className="py-2.5 pr-2">
                      {unit.tenant ? (
                        <>
                          <div className="font-semibold">{unit.tenant}</div>
                          {unit.contract && <div className="text-[9px] text-[#8996a9]">{unit.contract}</div>}
                          {unit.statusNote && <div className={`text-[9px] ${STATUS_NOTE_STYLE[unit.status]}`}>{unit.statusNote}</div>}
                        </>
                      ) : (
                        <div className={`text-[10px] ${STATUS_NOTE_STYLE[unit.status]}`}>{unit.statusNote}</div>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 font-semibold">{unit.price}</td>
                    <td className="py-2.5 pr-2 text-[#58657a]">{unit.sensor}</td>
                  </tr>
                ))}
                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[11px] text-[#8996a9]">
                      Không có kho nào phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
            <span>Hiển thị 1-{filteredUnits.length} trên {totalUnits} kho</span>
            <div className="flex items-center gap-1 font-semibold">
              <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">
                <span className="material-symbols-outlined text-[13px]">chevron_left</span>
              </button>
              <span className="rounded-[6px] bg-[#0b1c30] px-2 py-1 text-white">1</span>
              <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">2</button>
              <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">3</button>
              <button className="rounded-[6px] border border-[#dfe7f5] px-2 py-1">
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {selectedUnit ? (
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[9px] font-bold text-[#0e7b4c]">{selectedUnit.statusLabel}</span>
            <div className="mt-1 text-[15px] font-bold">Căn kho #{selectedUnit.unit}</div>
            <div className="text-[10px] text-[#8996a9]">{selectedUnit.locationLabel}</div>

            <div className="mt-2 flex h-24 items-center justify-center rounded-[10px] bg-[#0b1c30] text-[9px] font-semibold text-white/70">
              {selectedUnit.camera}
            </div>

            <div className="mt-3 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">{selectedUnit.lock.name}</span>
                <span className="rounded-full bg-[#e7f8ee] px-1.5 py-0.5 text-[9px] font-bold text-[#0e7b4c]">{selectedUnit.lock.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[9px] text-[#58657a]">
                <span>Pin {selectedUnit.lock.battery}</span>
                <span>Zigbee {selectedUnit.lock.signal}</span>
                <span>FW {selectedUnit.lock.firmware}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded-[8px] bg-[#1d5fe5] py-1.5 text-[10px] font-bold text-white">Mở khóa từ xa</button>
                <button className="flex-1 rounded-[8px] border border-[#dfe7f5] py-1.5 text-[10px] font-semibold text-[#3a475a]">Cấp mã OTP</button>
              </div>
            </div>

            <div className="mt-2 rounded-[10px] border border-[#eef1f8] p-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                Điều hòa vi khí hậu ({selectedUnit.climate.unit})
                <span className="text-[9px] font-semibold text-[#8996a9]">Mục tiêu: {selectedUnit.climate.target}</span>
              </div>
              <div className="mt-1 flex gap-x-3 text-[9px] text-[#58657a]">
                <span>Nhiệt độ {selectedUnit.climate.temp}</span>
                <span>Độ ẩm {selectedUnit.climate.humidity}</span>
              </div>
              <div className="mt-1 text-[9px] text-[#0e7b4c]">{selectedUnit.climate.note}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Lịch sử mở khóa gần nhất</span>
              <span className="text-[10px] font-bold text-[#1d5fe5]">Xem toàn bộ</span>
            </div>
            <div className="mt-1.5 space-y-1.5">
              {selectedUnit.accessLog.map((log) => (
                <div key={log.time} className="flex items-center justify-between rounded-[8px] bg-[#f8faff] px-2.5 py-1.5 text-[10px]">
                  <div>
                    <div className="font-semibold">{log.name}</div>
                    <div className="text-[9px] text-[#8996a9]">{log.role} • {log.method}</div>
                  </div>
                  <span className="text-[9px] text-[#8996a9]">{log.time}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-[8px] border border-[#dfe7f5] py-1.5 text-[10px] font-semibold text-[#3a475a]">Chỉnh sửa thông số</button>
              <button className="rounded-[8px] bg-[#0b1c30] py-1.5 text-[10px] font-bold text-white">Hợp đồng</button>
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[#dfe7f5] bg-white p-6 text-center text-[11px] text-[#8996a9]">
            Chọn một kho trong danh sách để xem chi tiết.
          </div>
        )}
      </div>
    </>
  );
}

export default AdminFacilityManagement;

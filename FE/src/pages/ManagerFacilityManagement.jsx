import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";

const UNIT_STATUS_BADGE = {
  available: "bg-[#e7f8ee] text-[#0e7b4c]",
  occupied: "bg-[#eef4ff] text-[#1d5fe5]",
  reserved: "bg-[#fff2d8] text-[#a15c00]",
  pending_inspection: "bg-[#fff2d8] text-[#a15c00]",
  maintenance: "bg-[#fdecec] text-[#c0362c]",
  out_of_service: "bg-[#f2f4f8] text-[#8996a9]",
};

const UNIT_STATUS_LABEL = {
  available: "Trống",
  occupied: "Đang thuê",
  reserved: "Đã giữ chỗ",
  pending_inspection: "Chờ kiểm tra",
  maintenance: "Đang bảo trì",
  out_of_service: "Ngưng hoạt động",
};

function formatVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

function ManagerFacilityManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [kpis, setKpis] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [filters, setFilters] = useState({
    facilityId: "all",
    floor: "all",
    zone: "all",
    unitTypeId: "all",
    status: "all",
    search: "",
  });

  // Storage Unit Modal (Create / Edit)
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    facilityId: "",
    unitTypeId: "",
    unitCode: "",
    floorLabel: "1",
    zoneLabel: "A",
    physicalStatus: "available",
    isListed: true,
    monthlyRate: 1850000,
    depositAmount: 1850000,
    notes: "",
  });

  // Facility Modal (Create / Edit)
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({
    code: "",
    name: "",
    addressLine: "",
    district: "",
    city: "TP. Hồ Chí Minh",
    openingTime: "07:00",
    closingTime: "21:00",
    status: "active",
  });

  // Map Layout State (Swagger API #4 & #5)
  const [activeView, setActiveView] = useState("inventory"); // "inventory" | "map_layout"
  const [mapLayout, setMapLayout] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const defaultFacId = facilities[0]?.id || 1;
      const targetFac = filters.facilityId !== "all" ? Number(filters.facilityId) : defaultFacId;
      const res = await managerService.getWarehouseOverview(targetFac);
      const data = res?.data;
      if (data) {
        setKpis(data.kpis);
        setFacilities(data.facilities || []);
        setUnitTypes(data.unitTypes || []);
        const unitList = data.units || [];
        setUnits(unitList);
        if (unitList.length > 0 && !selectedUnitId) {
          setSelectedUnitId(unitList[0].id);
        }
      }
    } catch (err) {
      setErrorMsg(err?.message || "Không thể tải dữ liệu kho từ SQL Server.");
    } finally {
      setLoading(false);
    }
  };

  const loadMapLayout = async (targetFacilityId) => {
    try {
      setMapLoading(true);
      const defaultFacId = facilities[0]?.id || 1;
      const facId = targetFacilityId || (filters.facilityId !== "all" ? Number(filters.facilityId) : defaultFacId);
      const res = await managerService.getMapLayout(facId);
      const layout = res?.data || res;
      setMapLayout(layout);
      if (layout?.areas?.length > 0) {
        setSelectedAreaId(layout.areas[0].areaId);
      }
    } catch (err) {
      console.warn("Could not load map layout:", err);
    } finally {
      setMapLoading(false);
    }
  };

  const handleSaveMapPosition = async (e) => {
    e.preventDefault();
    if (!mapLayout || !editingPosition) return;
    try {
      setSaving(true);
      const updatedPositions = mapLayout.unitPositions.map((p) =>
        p.unitId === editingPosition.unitId ? { ...p, ...editingPosition } : p
      );
      const defaultFacId = facilities[0]?.id || 1;
      const facId = mapLayout.facilityId || (filters.facilityId !== "all" ? Number(filters.facilityId) : defaultFacId);
      await managerService.updateMapLayout(facId, { positions: updatedPositions });
      setMapLayout((prev) => ({ ...prev, unitPositions: updatedPositions }));
      setEditingPosition(null);
      showToast(`Đã lưu tọa độ sơ đồ cho ô kho #${editingPosition.unitCode} vào Database!`);
    } catch (err) {
      setErrorMsg(err.message || "Lỗi khi lưu tọa độ sơ đồ kho");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
    if (activeView === "map_layout") {
      loadMapLayout();
    }
  }, [filters.facilityId, activeView]);

  const showToast = (msg) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(""), 4000);
  };

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (filters.facilityId !== "all" && String(u.facilityId) !== String(filters.facilityId)) return false;
      if (filters.floor !== "all" && String(u.floorLabel) !== String(filters.floor)) return false;
      if (filters.zone !== "all" && String(u.zoneLabel) !== String(filters.zone)) return false;
      if (filters.unitTypeId !== "all" && String(u.unitTypeId) !== String(filters.unitTypeId)) return false;
      if (filters.status !== "all" && u.physicalStatus !== filters.status) return false;
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const match =
          (u.unitCode || "").toLowerCase().includes(q) ||
          (u.facilityName || "").toLowerCase().includes(q) ||
          (u.unitTypeName || "").toLowerCase().includes(q) ||
          (u.tenantName || "").toLowerCase().includes(q) ||
          (u.notes || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [units, filters]);

  const selectedUnit = useMemo(() => {
    return units.find((u) => u.id === selectedUnitId) || filteredUnits[0] || null;
  }, [units, filteredUnits, selectedUnitId]);

  const currentAreaPositions = useMemo(() => {
    if (!mapLayout?.unitPositions) return [];
    if (!selectedAreaId) return mapLayout.unitPositions;
    return mapLayout.unitPositions.filter((p) => String(p.areaId) === String(selectedAreaId));
  }, [mapLayout, selectedAreaId]);

  const distinctFloors = useMemo(() => {
    return Array.from(new Set(units.map((u) => u.floorLabel || "1"))).sort();
  }, [units]);

  const distinctZones = useMemo(() => {
    return Array.from(new Set(units.map((u) => u.zoneLabel || "A"))).sort();
  }, [units]);

  const resetFilters = () => {
    setFilters({
      facilityId: "all",
      floor: "all",
      zone: "all",
      unitTypeId: "all",
      status: "all",
      search: "",
    });
  };

  // Unit CRUD Handlers
  const openCreateUnitModal = () => {
    const defaultFac = facilities[0]?.id || "";
    const defaultType = unitTypes[0]?.id || "";
    const defaultRate = unitTypes[0]?.defaultMonthlyRate || 1850000;
    setEditingUnit(null);
    setUnitForm({
      facilityId: defaultFac,
      unitTypeId: defaultType,
      unitCode: `A-${100 + units.length + 1}`,
      floorLabel: "1",
      zoneLabel: "A",
      physicalStatus: "available",
      isListed: true,
      monthlyRate: defaultRate,
      depositAmount: defaultRate,
      notes: "Kho tiêu chuẩn mới khởi tạo",
    });
    setUnitModalOpen(true);
  };

  const openEditUnitModal = (unit) => {
    setEditingUnit(unit);
    setUnitForm({
      facilityId: unit.facilityId,
      unitTypeId: unit.unitTypeId,
      unitCode: unit.unitCode,
      floorLabel: unit.floorLabel || "1",
      zoneLabel: unit.zoneLabel || "A",
      physicalStatus: unit.physicalStatus,
      isListed: unit.isListed,
      monthlyRate: unit.monthlyRate,
      depositAmount: unit.depositAmount || unit.monthlyRate,
      notes: unit.notes || "",
    });
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.facilityId || !unitForm.unitTypeId) {
      setErrorMsg("Vui lòng chọn cơ sở kho và loại diện tích trước khi lưu.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        facilityId: Number(unitForm.facilityId),
        unitTypeId: Number(unitForm.unitTypeId),
        unitCode: unitForm.unitCode,
        floorLabel: unitForm.floorLabel,
        zoneLabel: unitForm.zoneLabel,
        physicalStatus: unitForm.physicalStatus,
        isListed: Boolean(unitForm.isListed),
        notes: unitForm.notes,
        monthlyRate: Number(unitForm.monthlyRate),
        depositAmount: Number(unitForm.depositAmount || unitForm.monthlyRate),
      };

      if (editingUnit) {
        const res = await managerService.updateStorageUnit(editingUnit.id, payload);
        showToast(`Đã cập nhật ô kho ${res?.data?.unitCode || unitForm.unitCode} trong Database!`);
      } else {
        const res = await managerService.createStorageUnit(payload);
        if (res?.data?.id) setSelectedUnitId(res.data.id);
        showToast(`Đã thêm ô kho mới ${res?.data?.unitCode || unitForm.unitCode} vào Database!`);
      }
      setUnitModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi khi lưu thông tin ô kho.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (unit, newStatus) => {
    setSaving(true);
    setErrorMsg("");
    try {
      await managerService.updateStorageUnit(unit.id, {
        facilityId: unit.facilityId,
        unitTypeId: unit.unitTypeId,
        unitCode: unit.unitCode,
        floorLabel: unit.floorLabel,
        zoneLabel: unit.zoneLabel,
        physicalStatus: newStatus,
        isListed: unit.isListed,
        notes: unit.notes,
        monthlyRate: unit.monthlyRate,
        depositAmount: unit.depositAmount,
      });
      showToast(`Đã đổi trạng thái kho ${unit.unitCode} sang "${UNIT_STATUS_LABEL[newStatus] || newStatus}" trong Database!`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể đổi trạng thái ô kho.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ô kho #${unit.unitCode} (${unit.facilityName}) khỏi Database?`)) {
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      await managerService.deleteStorageUnit(unit.id);
      if (selectedUnitId === unit.id) setSelectedUnitId(null);
      showToast(`Đã xóa ô kho ${unit.unitCode} khỏi Database.`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể xóa ô kho.");
    } finally {
      setSaving(false);
    }
  };

  // Facility CRUD Handlers
  const openCreateFacilityModal = () => {
    setEditingFacility(null);
    setFacilityForm({
      code: `HCM-HUB0${facilities.length + 1}`,
      name: "",
      addressLine: "",
      district: "",
      city: "TP. Hồ Chí Minh",
      openingTime: "07:00",
      closingTime: "21:00",
      status: "active",
    });
    setFacilityModalOpen(true);
  };

  const openEditFacilityModal = (fac) => {
    setEditingFacility(fac);
    setFacilityForm({
      code: fac.code,
      name: fac.name,
      addressLine: fac.addressLine,
      district: fac.district || "",
      city: fac.city,
      openingTime: fac.openingTime || "07:00",
      closingTime: fac.closingTime || "21:00",
      status: fac.status || "active",
    });
    setFacilityModalOpen(true);
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      if (editingFacility) {
        await managerService.updateFacility(editingFacility.id, facilityForm);
        showToast(`Đã cập nhật cơ sở kho "${facilityForm.name}" trong Database!`);
      } else {
        await managerService.createFacility(facilityForm);
        showToast(`Đã tạo cơ sở kho mới "${facilityForm.name}" vào Database!`);
      }
      setFacilityModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi khi lưu cơ sở kho.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFacility = async (fac) => {
    if (!window.confirm(`Xóa cơ sở kho "${fac.name}" (${fac.code}) khỏi Database?`)) return;
    setSaving(true);
    setErrorMsg("");
    try {
      await managerService.deleteFacility(fac.id);
      showToast(`Đã xóa cơ sở kho "${fac.name}" khỏi Database.`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể xóa cơ sở kho (có thể đang có hợp đồng thuê gắn liền).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
            <span className="material-symbols-outlined text-[18px]">warehouse</span>
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-[19px] font-bold">Quản Lý Kho</h1>
            <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4a0]" />
              Live
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreateFacilityModal}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f5f7fd]"
          >
            <span className="material-symbols-outlined text-[15px]">domain_add</span>
            Thêm cơ sở
          </button>
          <button
            onClick={openCreateUnitModal}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3.5 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#1649b8]"
          >
            <span className="material-symbols-outlined text-[15px]">add_box</span>
            Thêm ô kho
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#2dd4a0] bg-[#effcf6] px-4 py-2.5 text-[12px] font-semibold text-[#0e7b4c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg("")} className="text-[11px] font-bold underline">
            Đóng
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#e5484d] bg-[#fdecec] px-4 py-2.5 text-[12px] font-semibold text-[#c0362c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-[11px] font-bold underline">
            Đóng
          </button>
        </div>
      )}

      {/* View Switcher: Inventory List vs Map Layout */}
      <div className="mt-4 flex items-center gap-2 border-b border-[#dfe7f5] pb-2">
        <button
          onClick={() => setActiveView("inventory")}
          className={`flex items-center gap-2 rounded-t-[8px] px-4 py-2 text-[12px] font-bold transition ${
            activeView === "inventory"
              ? "border-b-2 border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
              : "text-[#58657a] hover:bg-[#f8faff]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          Danh Sách Ô Kho & Quản Lý Cơ Sở
          <span className="rounded-full bg-[#1d5fe5] px-2 py-0.5 text-[9px] font-bold text-white">
            {units.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveView("map_layout");
            loadMapLayout();
          }}
          className={`flex items-center gap-2 rounded-t-[8px] px-4 py-2 text-[12px] font-bold transition ${
            activeView === "map_layout"
              ? "border-b-2 border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
              : "text-[#58657a] hover:bg-[#f8faff]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">map</span>
          Sơ Đồ Bản Đồ Mặt Bằng (Map Layout)
          <span className="rounded-full bg-[#0e7b4c] px-2 py-0.5 text-[9px] font-bold text-white">
            2D Grid
          </span>
        </button>
      </div>

      {activeView === "inventory" ? (
        <>
          {/* KPIs */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                Tổng Số Ô Kho
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">inventory_2</span>
              </div>
              <div className="mt-1 text-[19px] font-bold">{kpis ? kpis.totalUnits : "..."}</div>
            </div>

            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                Kho Còn Trống
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">check_circle</span>
              </div>
              <div className="mt-1 text-[19px] font-bold text-[#0e7b4c]">{kpis ? kpis.availableUnits : "..."}</div>
            </div>

            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                Đang Cho Thuê
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">lock</span>
              </div>
              <div className="mt-1 text-[19px] font-bold text-[#1d5fe5]">{kpis ? kpis.occupiedUnits : "..."}</div>
            </div>

            <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                Đã Đặt Cọc / Chờ Check-in
                <span className="material-symbols-outlined text-[14px] text-[#a15c00]">schedule</span>
              </div>
              <div className="mt-1 text-[19px] font-bold text-[#a15c00]">{kpis ? kpis.reservedUnits : "..."}</div>
            </div>

            <div className="rounded-[12px] border border-[#e5484d]/40 bg-[#fdf4f4] p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#c0362c]">
                Bảo Trì / Ngưng Khai Thác
                <span className="material-symbols-outlined text-[14px] text-[#e5484d]">build</span>
              </div>
              <div className="mt-1 text-[19px] font-bold text-[#c0362c]">
                {kpis ? kpis.maintenanceUnits + kpis.outOfServiceUnits : "..."}
              </div>
            </div>
          </div>

          {/* Facilities Row */}
          <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold">Cơ Sở Kho</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  className={`rounded-[12px] border p-3 transition ${
                    String(filters.facilityId) === String(fac.id)
                      ? "border-[#1d5fe5] bg-[#eef4ff]/40"
                      : "border-[#eef1f8] bg-[#f8faff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          facilityId: String(prev.facilityId) === String(fac.id) ? "all" : String(fac.id),
                        }))
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#0b1c30] px-1.5 py-0.5 text-[9px] font-bold text-white">{fac.code}</span>
                        <span className="text-[12px] font-bold text-[#0b1c30]">{fac.name}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-[#58657a]">
                        {fac.addressLine}, {fac.district ? `${fac.district}, ` : ""}{fac.city}
                      </div>
                    </div>
                    <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[9px] font-bold text-[#0e7b4c]">
                      {fac.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-[#e5eaf5] pt-2 text-[10px]">
                    <span className="font-semibold text-[#3a475a]">
                      Tổng: <strong>{fac.totalUnits}</strong> kho • Trống: <strong className="text-[#0e7b4c]">{fac.availableUnits}</strong> • Thuê: <strong className="text-[#1d5fe5]">{fac.occupiedUnits}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditFacilityModal(fac)}
                        className="rounded border border-[#dfe7f5] bg-white px-2 py-0.5 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(fac)}
                        className="rounded border border-[#f5d0d0] bg-[#fdf4f4] px-2 py-0.5 text-[10px] font-bold text-[#c0362c] hover:bg-[#fbe4e4]"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12px] font-bold">Bộ Lọc</div>
              <button onClick={resetFilters} className="flex items-center gap-1 text-[10px] font-bold text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[13px]">filter_alt_off</span>
                Xóa bộ lọc
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Tìm kiếm nhanh</span>
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  placeholder="Mã kho A-101, tên khách..."
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Cơ sở kho</span>
                <select
                  value={filters.facilityId}
                  onChange={(e) => setFilters((p) => ({ ...p, facilityId: e.target.value }))}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
                >
                  <option value="all">Tất cả cơ sở</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Tầng</span>
                <select
                  value={filters.floor}
                  onChange={(e) => setFilters((p) => ({ ...p, floor: e.target.value }))}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
                >
                  <option value="all">Tất cả tầng</option>
                  {distinctFloors.map((fl) => (
                    <option key={fl} value={fl}>
                      Tầng {fl}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Khu</span>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters((p) => ({ ...p, zone: e.target.value }))}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
                >
                  <option value="all">Tất cả khu vực</option>
                  {distinctZones.map((zn) => (
                    <option key={zn} value={zn}>
                      Zone {zn}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Loại diện tích</span>
                <select
                  value={filters.unitTypeId}
                  onChange={(e) => setFilters((p) => ({ ...p, unitTypeId: e.target.value }))}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
                >
                  <option value="all">Tất cả loại kho</option>
                  {unitTypes.map((ut) => (
                    <option key={ut.id} value={ut.id}>
                      {ut.code} - {ut.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase text-[#8996a9]">Trạng thái vận hành</span>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {Object.entries(UNIT_STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Main Inventory Table & Detail Side Panel */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold">Ô Kho</span>
                  <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                    {filteredUnits.length} ô kho
                  </span>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#1d5fe5] hover:underline"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Tải lại
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                      <th className="py-2 pr-2">Mã Ô Kho</th>
                      <th className="py-2 pr-2">Loại Kho &amp; Kích Thước</th>
                      <th className="py-2 pr-2">Cơ Sở / Vị Trí</th>
                      <th className="py-2 pr-2">Khách Thuê / Trạng Thái</th>
                      <th className="py-2 pr-2 text-right">Giá Thuê / Tháng</th>
                      <th className="py-2 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[11px] text-[#8996a9]">
                          Đang tải danh sách ô kho từ SQL Server...
                        </td>
                      </tr>
                    ) : filteredUnits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[11px] text-[#8996a9]">
                          Không có ô kho nào khớp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredUnits.map((unit) => (
                        <tr
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`cursor-pointer border-b border-[#f2f5fb] border-l-2 transition ${
                            selectedUnit?.id === unit.id
                              ? "border-l-[#1d5fe5] bg-[#eef4ff]/40"
                              : unit.physicalStatus === "maintenance"
                              ? "border-l-[#e5484d] bg-[#fdf4f4]/60"
                              : "border-l-transparent hover:bg-[#f8faff]"
                          }`}
                        >
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-[#1d5fe5]">#{unit.unitCode}</div>
                          </td>
                          <td className="py-2.5 pr-2">
                            <div className="font-semibold text-[#0b1c30]">{unit.dimensionsLabel}</div>
                          </td>
                          <td className="py-2.5 pr-2">
                            <div className="font-semibold text-[#3a475a]">{unit.facilityName}</div>
                          </td>
                          <td className="py-2.5 pr-2">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                UNIT_STATUS_BADGE[unit.physicalStatus] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {UNIT_STATUS_LABEL[unit.physicalStatus] || unit.physicalStatus}
                            </span>
                            {unit.tenantName && (
                              <div className="mt-0.5 text-[10px] font-semibold text-[#0b1c30]">
                                👤 {unit.tenantName} ({unit.agreementNo})
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 pr-2 text-right font-bold text-[#0b1c30]">
                            {formatVnd(unit.monthlyRate)}
                          </td>
                          <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openEditUnitModal(unit)}
                                className="rounded-[6px] border border-[#dfe7f5] bg-white px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit)}
                                disabled={saving}
                                className="rounded-[6px] border border-[#f5d0d0] bg-[#fdf4f4] px-2.5 py-1 text-[10px] font-bold text-[#c0362c] hover:bg-[#fbe4e4]"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Unit Detail & Quick Edit Panel */}
            {selectedUnit ? (
              <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      UNIT_STATUS_BADGE[selectedUnit.physicalStatus] || "bg-gray-100"
                    }`}
                  >
                    {UNIT_STATUS_LABEL[selectedUnit.physicalStatus] || selectedUnit.physicalStatus}
                  </span>
                  <span className="text-[10px] font-semibold text-[#8996a9]">
                    {selectedUnit.isListed ? "Đang hiển thị trên Catalog" : "Đang ẩn"}
                  </span>
                </div>

                <div className="mt-2 text-[17px] font-bold text-[#0b1c30]">
                  Kho #{selectedUnit.unitCode}
                </div>
                <div className="text-[11px] font-semibold text-[#1d5fe5]">
                  {selectedUnit.facilityName} ({selectedUnit.facilityCode})
                </div>

                <div className="mt-3 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-[11px]">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#8996a9]">Loại kho:</span>
                    <span className="font-bold text-[#0b1c30]">{selectedUnit.unitTypeName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#8996a9]">Giá thuê / tháng:</span>
                    <span className="font-bold text-[#0e7b4c]">{formatVnd(selectedUnit.monthlyRate)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#8996a9]">Tiền đặt cọc:</span>
                    <span className="font-semibold text-[#3a475a]">{formatVnd(selectedUnit.depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#8996a9]">Khách đang thuê:</span>
                    <span className="font-semibold text-[#0b1c30]">
                      {selectedUnit.tenantName || "Chưa có khách thuê"}
                    </span>
                  </div>
                  {selectedUnit.agreementNo && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#8996a9]">Mã hợp đồng:</span>
                      <span className="font-semibold text-[#1d5fe5]">{selectedUnit.agreementNo}</span>
                    </div>
                  )}
                  <div className="mt-1 border-t border-[#e5eaf5] pt-2 text-[10px] text-[#58657a]">
                    <strong>Ghi chú:</strong> {selectedUnit.notes || "Không có ghi chú"}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                    Đổi nhanh trạng thái
                  </label>
                  <select
                    value={selectedUnit.physicalStatus}
                    onChange={(e) => handleQuickStatusChange(selectedUnit, e.target.value)}
                    disabled={saving}
                    className="mt-1.5 w-full rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-2 text-[11px] font-bold text-[#0b1c30]"
                  >
                    {Object.entries(UNIT_STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openEditUnitModal(selectedUnit)}
                    className="flex items-center justify-center gap-1 rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white hover:bg-[#1649b8]"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Sửa Thông Số / Giá
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(selectedUnit)}
                    disabled={saving}
                    className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f5d0d0] bg-[#fdf4f4] py-2 text-[11px] font-bold text-[#c0362c] hover:bg-[#fbe4e4]"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Xóa Ô Kho
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-[#dfe7f5] bg-white p-6 text-center text-[11px] text-[#8996a9]">
                Chọn một ô kho từ danh sách bên trái để xem chi tiết và thao tác.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Map Layout View (Swagger API #4 & #5) */
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#8996a9] uppercase">Cơ sở:</span>
                <select
                  value={filters.facilityId !== "all" ? filters.facilityId : "1"}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, facilityId: e.target.value }));
                    loadMapLayout(Number(e.target.value));
                  }}
                  className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0b1c30]"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.code} - {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area selector tabs */}
              <div className="flex items-center gap-1 border-l border-[#dfe7f5] pl-3">
                <span className="text-[11px] font-bold text-[#8996a9] uppercase">Khu vực / Tầng:</span>
                {mapLayout?.areas?.map((a) => (
                  <button
                    key={a.areaId}
                    onClick={() => setSelectedAreaId(a.areaId)}
                    className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
                      String(selectedAreaId) === String(a.areaId)
                        ? "bg-[#1d5fe5] text-white"
                        : "border border-[#dfe7f5] bg-white text-[#58657a] hover:bg-[#f8faff]"
                    }`}
                  >
                    {a.name} ({a.code})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadMapLayout()}
                className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-bold text-[#3a475a] hover:bg-[#f8faff]"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Tải lại sơ đồ
              </button>
            </div>
          </div>

          {/* Interactive 2D Canvas & Inspector */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            {/* 2D Canvas */}
            <div className="relative min-h-[500px] overflow-hidden rounded-[16px] border border-[#dfe7f5] bg-[#f8faff] p-4 bg-[radial-gradient(#dfe7f5_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="mb-2 flex items-center justify-between text-[11px] text-[#8996a9]">
                <span>
                  Sơ đồ 2D mặt bằng: Click vào ô kho để xem thông số và điều chỉnh tọa độ (Swagger API #4 &amp; #5)
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#0e7b4c]" /> Trống
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#1d5fe5]" /> Đang thuê
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#a15c00]" /> Giữ chỗ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#c0362c]" /> Bảo trì
                  </span>
                </div>
              </div>

              {mapLoading ? (
                <div className="flex h-[420px] items-center justify-center text-[12px] font-bold text-[#8996a9]">
                  Đang tải sơ đồ mặt bằng từ API /manager/facilities/map-layout...
                </div>
              ) : currentAreaPositions.length === 0 ? (
                <div className="flex h-[420px] items-center justify-center text-[12px] font-bold text-[#8996a9]">
                  Chưa có ô kho nào được định vị tại khu vực này.
                </div>
              ) : (
                <div className="relative h-[440px] w-full rounded-[12px] border border-dashed border-[#cbd5e1] bg-white/70 shadow-inner">
                  {currentAreaPositions.map((pos) => {
                    const isSelected = editingPosition?.unitId === pos.unitId;
                    return (
                      <div
                        key={pos.unitId}
                        onClick={() => setEditingPosition({ ...pos })}
                        style={{
                          left: `${Math.min(90, Math.max(2, Number(pos.x || 10)))}%`,
                          top: `${Math.min(85, Math.max(5, Number(pos.y || 10)))}%`,
                          width: `${Math.max(45, Number(pos.width || 60))}px`,
                          height: `${Math.max(45, Number(pos.height || 60))}px`,
                          transform: `rotate(${pos.rotationDegrees || 0}deg)`,
                        }}
                        className={`absolute flex cursor-pointer flex-col items-center justify-center rounded-[8px] border p-1 shadow-xs transition hover:scale-105 hover:z-20 ${
                          UNIT_STATUS_BADGE[pos.physicalStatus] || "bg-white text-gray-700"
                        } ${isSelected ? "ring-2 ring-[#1d5fe5] scale-105 z-30" : ""}`}
                      >
                        <span className="font-bold text-[10px] leading-tight">#{pos.unitCode}</span>
                        <span className="text-[7.5px] uppercase font-bold opacity-80">
                          {UNIT_STATUS_LABEL[pos.physicalStatus] || pos.physicalStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Position Inspector & Update Form (Swagger API #5) */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              {editingPosition ? (
                <form onSubmit={handleSaveMapPosition} className="space-y-3 text-[11px]">
                  <div className="border-b border-[#eef1f8] pb-2">
                    <span className="text-[9px] font-bold uppercase text-[#8996a9]">Chi tiết vị trí</span>
                    <h3 className="text-[15px] font-bold text-[#0b1c30]">Kho #{editingPosition.unitCode}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-[#3a475a]">Tọa độ X (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="95"
                        required
                        value={editingPosition.x}
                        onChange={(e) =>
                          setEditingPosition((prev) => ({ ...prev, x: Number(e.target.value) }))
                        }
                        className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-[#3a475a]">Tọa độ Y (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        required
                        value={editingPosition.y}
                        onChange={(e) =>
                          setEditingPosition((prev) => ({ ...prev, y: Number(e.target.value) }))
                        }
                        className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-[#3a475a]">Chiều rộng (px)</span>
                      <input
                        type="number"
                        min="30"
                        max="200"
                        value={editingPosition.width}
                        onChange={(e) =>
                          setEditingPosition((prev) => ({ ...prev, width: Number(e.target.value) }))
                        }
                        className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-[#3a475a]">Chiều cao (px)</span>
                      <input
                        type="number"
                        min="30"
                        max="200"
                        value={editingPosition.height}
                        onChange={(e) =>
                          setEditingPosition((prev) => ({ ...prev, height: Number(e.target.value) }))
                        }
                        className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="font-bold text-[#3a475a]">Góc quay (độ)</span>
                    <select
                      value={editingPosition.rotationDegrees || 0}
                      onChange={(e) =>
                        setEditingPosition((prev) => ({
                          ...prev,
                          rotationDegrees: Number(e.target.value),
                        }))
                      }
                      className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 font-semibold"
                    >
                      <option value={0}>0° (Nằm ngang)</option>
                      <option value={90}>90° (Dọc - Phải)</option>
                      <option value={180}>180° (Đảo ngược)</option>
                      <option value={270}>270° (Dọc - Trái)</option>
                    </select>
                  </label>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-1.5 rounded-[8px] bg-[#1d5fe5] py-2 font-bold text-white shadow-sm hover:bg-[#1649b8]"
                    >
                      <span className="material-symbols-outlined text-[15px]">save</span>
                      {saving ? "Đang lưu vị trí..." : "Lưu Sơ Đồ Vị Trí"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPosition(null)}
                      className="rounded-[8px] border border-[#dfe7f5] py-1.5 font-bold text-[#58657a] hover:bg-[#f8faff]"
                    >
                      Đóng
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-12 text-center text-[11px] text-[#8996a9]">
                  Click vào một ô kho trên sơ đồ 2D bên trái để xem và sửa đổi tọa độ.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT STORAGE UNIT MODAL */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                {editingUnit ? `Chỉnh Sửa Ô Kho #${editingUnit.unitCode}` : "Thêm Ô Kho Mới Vào Database"}
              </h2>
              <button onClick={() => setUnitModalOpen(false)} className="text-[#8996a9]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Cơ sở kho (Facility) *</span>
                  <select
                    required
                    value={unitForm.facilityId}
                    onChange={(e) => setUnitForm((p) => ({ ...p, facilityId: Number(e.target.value) }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} - {f.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Mã Ô Kho (Unit Code) *</span>
                  <input
                    required
                    value={unitForm.unitCode}
                    onChange={(e) => setUnitForm((p) => ({ ...p, unitCode: e.target.value.toUpperCase() }))}
                    placeholder="VD: A-115 hoặc B-201"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold uppercase text-[#1d5fe5]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="col-span-1 flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Tầng (Floor) *</span>
                  <input
                    required
                    value={unitForm.floorLabel}
                    onChange={(e) => setUnitForm((p) => ({ ...p, floorLabel: e.target.value }))}
                    placeholder="1"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
                <label className="col-span-1 flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Khu vực (Zone) *</span>
                  <input
                    required
                    value={unitForm.zoneLabel}
                    onChange={(e) => setUnitForm((p) => ({ ...p, zoneLabel: e.target.value.toUpperCase() }))}
                    placeholder="A"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 uppercase"
                  />
                </label>
                <label className="col-span-1 flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Trạng thái *</span>
                  <select
                    value={unitForm.physicalStatus}
                    onChange={(e) => setUnitForm((p) => ({ ...p, physicalStatus: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    {Object.entries(UNIT_STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Loại kho &amp; Kích thước (Unit Type) *</span>
                <select
                  value={unitForm.unitTypeId}
                  onChange={(e) => {
                    const utId = Number(e.target.value);
                    const ut = unitTypes.find((x) => x.id === utId);
                    setUnitForm((p) => ({
                      ...p,
                      unitTypeId: utId,
                      monthlyRate: ut?.defaultMonthlyRate || p.monthlyRate,
                      depositAmount: ut?.defaultMonthlyRate || p.depositAmount,
                    }));
                  }}
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                >
                  <option value="">-- Chọn loại kho --</option>
                  {unitTypes.map((ut) => (
                    <option key={ut.id} value={ut.id}>
                      {ut.code} — {ut.name} ({ut.widthM}m × {ut.lengthM}m × {ut.heightM}m)
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Giá thuê niêm yết / tháng (VNĐ) *</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={unitForm.monthlyRate}
                    onChange={(e) => setUnitForm((p) => ({ ...p, monthlyRate: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold text-[#0e7b4c]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Tiền đặt cọc (VNĐ)</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={unitForm.depositAmount}
                    onChange={(e) => setUnitForm((p) => ({ ...p, depositAmount: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Ghi chú vận hành (Notes)</span>
                <input
                  value={unitForm.notes}
                  onChange={(e) => setUnitForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="VD: Kho gần cửa chính, trang bị khóa thông minh Zigbee..."
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                />
              </label>

              <label className="flex items-center gap-2 pt-1 font-semibold text-[#3a475a]">
                <input
                  type="checkbox"
                  checked={unitForm.isListed}
                  onChange={(e) => setUnitForm((p) => ({ ...p, isListed: e.target.checked }))}
                  className="h-4 w-4 accent-[#1d5fe5]"
                />
                Hiển thị ô kho này trên trang Đặt Kho cho khách hàng
              </label>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[8px] bg-[#1d5fe5] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#1649b8]"
                >
                  {saving ? "Đang lưu vào DB..." : editingUnit ? "Lưu Thay Đổi" : "Thêm Ô Kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FACILITY MODAL */}
      {facilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[15px] font-bold text-[#0b1c30]">
                {editingFacility ? `Sửa Cơ Sở Kho ${editingFacility.code}` : "Thêm Cơ Sở Kho Mới"}
              </h2>
              <button onClick={() => setFacilityModalOpen(false)} className="text-[#8996a9]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Mã cơ sở (Code) *</span>
                  <input
                    required
                    value={facilityForm.code}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: HCM-Q7"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold uppercase"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Trạng thái</span>
                  <select
                    value={facilityForm.status}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, status: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Đang bảo trì</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Tên cơ sở kho *</span>
                <input
                  required
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: District 7 Self Storage"
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Địa chỉ *</span>
                <input
                  required
                  value={facilityForm.addressLine}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, addressLine: e.target.value }))}
                  placeholder="VD: 120 Nguyễn Thị Thập"
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Quận / Huyện</span>
                  <input
                    value={facilityForm.district}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, district: e.target.value }))}
                    placeholder="Quận 7"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Tỉnh / Thành phố *</span>
                  <input
                    required
                    value={facilityForm.city}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="TP. Hồ Chí Minh"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setFacilityModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[8px] bg-[#1d5fe5] px-5 py-2 font-bold text-white"
                >
                  {saving ? "Đang lưu..." : "Lưu Cơ Sở Kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerFacilityManagement;

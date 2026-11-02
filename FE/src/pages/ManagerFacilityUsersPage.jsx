import { useState, useEffect, useMemo, useRef } from "react";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import managerUserService from "../api/managerUserService";

const STAFF_POSITIONS = [
  "Nhân viên cơ sở (Facility Staff)",
  "Nhân viên bảo trì (Maintenance Staff)",
  "Nhân viên vệ sinh (Cleaning Staff)",
  "Nhân viên an ninh (Security Staff)",
  "Nhân viên kỹ thuật (Technical Staff)",
];

export default function ManagerFacilityUsersPage() {
  const { activeFacility, facilityId, facilities } = useManagerFacility();
  const [activeTab, setActiveTab] = useState("staff"); // 'staff' | 'customers'

  // Tab 1: Staff State
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffModalMode, setStaffModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    position: STAFF_POSITIONS[0],
    isActive: true,
  });
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Tab 2: Customers State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const requestId = useRef(0);

  // Load Staff List
  const loadStaffs = async () => {
    const cur = ++requestId.current;
    setStaffLoading(true);
    setErrorMsg("");
    try {
      const data = await managerUserService.getStaffs(facilityId);
      if (cur === requestId.current) {
        setStaffList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (cur === requestId.current) {
        setErrorMsg(err.message || "Không thể tải danh sách nhân viên.");
      }
    } finally {
      if (cur === requestId.current) setStaffLoading(false);
    }
  };

  // Load Customers List
  const loadCustomers = async () => {
    const cur = ++requestId.current;
    setCustomersLoading(true);
    setErrorMsg("");
    try {
      const data = await managerUserService.getFacilityCustomers(facilityId);
      if (cur === requestId.current) {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (cur === requestId.current) {
        setErrorMsg(err.message || "Không thể tải danh sách khách hàng cơ sở.");
      }
    } finally {
      if (cur === requestId.current) setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "staff") {
      loadStaffs();
    } else {
      loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, activeTab]);

  // Tab 1: Filtered Staff
  const filteredStaffList = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter(
      (s) =>
        (s.fullName || s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phoneNumber || "").toLowerCase().includes(q) ||
        (s.position || s.role || "").toLowerCase().includes(q)
    );
  }, [staffList, staffSearch]);

  // Tab 2: Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.fullName || "").toLowerCase().includes(q) ||
        (c.phoneNumber || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.unitCode || "").toLowerCase().includes(q) ||
        (c.agreementNo || "").toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  // Handlers for Staff Modals
  function openCreateStaffModal() {
    setSelectedStaff(null);
    setStaffFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      position: STAFF_POSITIONS[0],
      isActive: true,
    });
    setStaffModalMode("create");
    setErrorMsg("");
  }

  function openEditStaffModal(staff) {
    setSelectedStaff(staff);
    setStaffFormData({
      fullName: staff.fullName || staff.name || "",
      email: staff.email || "",
      phoneNumber: staff.phoneNumber || staff.phone || "",
      position: staff.position || staff.role || STAFF_POSITIONS[0],
      isActive: staff.isActive ?? true,
    });
    setStaffModalMode("edit");
    setErrorMsg("");
  }

  function closeStaffModal() {
    setStaffModalMode(null);
    setSelectedStaff(null);
    setErrorMsg("");
  }

  async function handleSaveStaff(e) {
    e.preventDefault();
    setStaffSubmitting(true);
    setErrorMsg("");

    try {
      if (staffModalMode === "create") {
        const payload = {
          ...staffFormData,
          facilityId: Number(facilityId || 1),
        };
        await managerUserService.createStaff(payload);
        setToastMsg(`Đã thêm nhân viên "${staffFormData.fullName}" thành công.`);
      } else if (staffModalMode === "edit" && selectedStaff) {
        const payload = {
          fullName: staffFormData.fullName,
          phoneNumber: staffFormData.phoneNumber,
          position: staffFormData.position,
          isActive: staffFormData.isActive,
          facilityId: Number(facilityId || 1),
        };
        await managerUserService.updateStaff(selectedStaff.id, payload);
        setToastMsg(`Đã cập nhật thông tin nhân viên "${staffFormData.fullName}".`);
      }
      closeStaffModal();
      loadStaffs();
    } catch (err) {
      setErrorMsg(err.message || "Lỗi lưu thông tin nhân viên.");
    } finally {
      setStaffSubmitting(false);
    }
  }

  // Toggle Active / Inactive for Staff
  async function handleToggleStaffStatus(staff) {
    const nextStatus = !(staff.isActive ?? true);
    setStatusUpdatingId(staff.id);
    setErrorMsg("");

    // Optimistic UI update
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, isActive: nextStatus } : s))
    );

    try {
      await managerUserService.updateStaffStatus(staff.id, nextStatus);
      setToastMsg(`Đã chuyển nhân viên "${staff.fullName || staff.name}" sang ${nextStatus ? "Hoạt động (Active)" : "Ngừng hoạt động (Inactive)"}.`);
    } catch (err) {
      // Revert if failed
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, isActive: !nextStatus } : s))
      );
      setErrorMsg(err.message || "Không thể cập nhật trạng thái nhân viên.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý Người dùng &amp; Nhân sự cơ sở
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Cơ sở quản lý: <strong className="text-slate-800">{activeFacility?.name ? `${activeFacility.name} (${activeFacility.code || `ID: ${facilityId}`})` : facilityId ? `Cơ sở #${facilityId}` : "Tất cả cơ sở"}</strong>
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "staff"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Tab 1 – Nhân viên cơ sở ({staffList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "customers"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>Tab 2 – Khách hàng cơ sở ({customers.length})</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
          <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: STAFF MANAGEMENT
          ======================================================== */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
              <input
                type="search"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Tìm nhân viên theo tên, email, SĐT, vị trí..."
                className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadStaffs}
                disabled={staffLoading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {staffLoading ? "Đang tải..." : "Làm mới"}
              </button>
              <button
                type="button"
                onClick={openCreateStaffModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Thêm nhân viên</span>
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã NV / Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3">Vị trí / Chức vụ</th>
                  <th className="px-4 py-3 text-center">Trạng thái (Active/Inactive)</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Đang tải danh sách nhân viên cơ sở...
                    </td>
                  </tr>
                ) : filteredStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Không có nhân viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredStaffList.map((staff) => {
                    const isActive = staff.isActive ?? true;
                    const isUpdating = statusUpdatingId === staff.id;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-bold text-[#1d5fe5] text-[11px]">
                              {(staff.fullName || staff.name || "S").charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div>{staff.fullName || staff.name || `Staff #${staff.id}`}</div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {staff.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                          {staff.email || "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-700 font-semibold">
                          {staff.phoneNumber || staff.phone || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {staff.position || staff.role || "Nhân viên cơ sở"}
                          </span>
                        </td>

                        {/* Toggle Active / Inactive */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleStaffStatus(staff)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition shadow-2xs ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                            }`}
                            title="Bấm để bật/tắt trạng thái hoạt động"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{isUpdating ? "..." : isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEditStaffModal(staff)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: FACILITY CUSTOMERS (READ-ONLY)
          ======================================================== */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">visibility</span>
              <div>
                <p className="font-bold text-blue-900">
                  Danh sách Khách hàng tại cơ sở (Chế độ Read-only)
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Hiển thị các khách hàng hiện đang có đơn đặt chỗ (Reservation) hoặc hợp đồng thuê (Agreement) tại cơ sở này.
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-blue-600">
              GET /api/manager/customers
            </span>
          </div>

          {/* Search bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
              <input
                type="search"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Tìm khách hàng theo tên, SĐT, email, mã kho, hợp đồng..."
                className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={loadCustomers}
              disabled={customersLoading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {customersLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã KH / Họ tên</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Ô kho sử dụng</th>
                  <th className="px-4 py-3">Hợp đồng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Đang tải danh sách khách hàng...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Không có khách hàng nào tại cơ sở này.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cus) => (
                    <tr key={cus.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                            {(cus.fullName || "K").charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div>{cus.fullName || `Khách hàng #${cus.id}`}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{cus.customerCode || `#${cus.id}`}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-800 font-semibold">
                        {cus.phoneNumber || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {cus.email || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#1d5fe5]">
                          {cus.unitCode ? `Kho ${cus.unitCode}` : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-slate-700">
                        {cus.agreementNo || "—"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 capitalize">
                          {cus.status || "Đang thuê"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THÊM / SỬA NHÂN VIÊN
          ======================================================== */}
      {staffModalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {staffModalMode === "create" ? "Thêm nhân viên mới vào cơ sở" : "Chỉnh sửa thông tin nhân viên"}
              </h2>
              <button
                type="button"
                onClick={closeStaffModal}
                disabled={staffSubmitting}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên nhân viên..."
                  value={staffFormData.fullName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={staffModalMode === "edit"} // Email thường không sửa được
                  placeholder="VD: staff.name@selfstorage.vn"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#1d5fe5] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0901234567"
                  value={staffFormData.phoneNumber}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vị trí / Chức vụ *
                </label>
                <select
                  value={staffFormData.position}
                  onChange={(e) => setStaffFormData({ ...staffFormData, position: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#1d5fe5]"
                >
                  {STAFF_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkbox Active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="staff-active-check"
                  checked={staffFormData.isActive}
                  onChange={(e) => setStaffFormData({ ...staffFormData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-[#1d5fe5] focus:ring-[#1d5fe5]"
                />
                <label htmlFor="staff-active-check" className="font-semibold text-slate-700 cursor-pointer">
                  Kích hoạt trạng thái làm việc (Active)
                </label>
              </div>

              {errorMsg && (
                <div role="alert" className="rounded-lg bg-rose-50 p-2.5 text-rose-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  disabled={staffSubmitting}
                  onClick={closeStaffModal}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={staffSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-4 py-1.5 font-bold text-white shadow-xs transition disabled:opacity-50"
                >
                  <span>{staffSubmitting ? "Đang lưu..." : staffModalMode === "create" ? "Thêm nhân viên" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

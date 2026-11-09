import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
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
  const { t, translateStatus } = useLanguage();
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
    password: "",
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
      password: "",
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

    if (staffModalMode === "create" && (!staffFormData.password || staffFormData.password.trim().length < 6)) {
      setErrorMsg("Mật khẩu ban đầu phải có ít nhất 6 ký tự.");
      return;
    }

    if (!facilityId || Number(facilityId) <= 0) {
      setErrorMsg("Vui lòng chọn cơ sở quản lý hợp lệ trước khi thao tác.");
      return;
    }

    setStaffSubmitting(true);
    setErrorMsg("");

    try {
      if (staffModalMode === "create") {
        const payload = {
          ...staffFormData,
          facilityId: Number(facilityId),
          assignmentRole: staffFormData.position || "facility_staff",
        };
        await managerUserService.createStaff(payload);
        setToastMsg(`Đã thêm nhân viên "${staffFormData.fullName}" thành công.`);
      } else if (staffModalMode === "edit" && selectedStaff) {
        const payload = {
          fullName: staffFormData.fullName,
          phoneNumber: staffFormData.phoneNumber,
          position: staffFormData.position,
          assignmentRole: staffFormData.position,
          isActive: staffFormData.isActive,
          facilityId: Number(facilityId),
        };
        const staffId = selectedStaff?.userId ?? selectedStaff?.id;
        await managerUserService.updateStaff(staffId, payload);
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
    const targetStaffId = staff?.userId ?? staff?.id;
    if (!targetStaffId) return;
    const nextStatus = !(staff.isActive ?? true);
    setStatusUpdatingId(targetStaffId);
    setErrorMsg("");

    // Optimistic UI update
    setStaffList((prev) =>
      prev.map((s) => ((s.userId ?? s.id) === targetStaffId ? { ...s, isActive: nextStatus } : s))
    );

    try {
      await managerUserService.updateStaffStatus(targetStaffId, nextStatus);
      setToastMsg(`Đã chuyển nhân viên "${staff.fullName || staff.name}" sang ${nextStatus ? "Hoạt động (Active)" : "Ngừng hoạt động (Inactive)"}.`);
    } catch (err) {
      // Revert if failed
      setStaffList((prev) =>
        prev.map((s) => ((s.userId ?? s.id) === targetStaffId ? { ...s, isActive: !nextStatus } : s))
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
            {t("nav.staff_customers", "Nhân sự & Khách hàng")}
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
            <span>{t("nav.customers", "Khách hàng")} ({customers.length})</span>
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>{t("manager.add_employee", "Thêm nhân viên")}</span>
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">{t("manager.staff_name_or_code", "Mã NV / Tên")}</th>
                  <th className="px-4 py-3">{t("common.email", "Email")}</th>
                  <th className="px-4 py-3">{t("common.phone", "Số điện thoại")}</th>
                  <th className="px-4 py-3">{t("common.role", "Chức vụ")}</th>
                  <th className="px-4 py-3 text-center">{t("common.status", "Trạng thái")}</th>
                  <th className="px-4 py-3 text-right">{t("common.actions", "Thao tác")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      {t("manager.loading_staff", "Đang tải danh sách nhân viên...")}
                    </td>
                  </tr>
                ) : filteredStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      {t("manager.no_staff", "Không có nhân viên nào phù hợp.")}
                    </td>
                  </tr>
                ) : (
                  filteredStaffList.map((staff) => {
                    const isActive = staff.isActive ?? true;
                    const currentStaffId = staff?.userId ?? staff?.id;
                    const isUpdating = statusUpdatingId === currentStaffId;

                    return (
                      <tr key={currentStaffId ?? staff.employeeCode} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                              {(staff.fullName || staff.name || "S").charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div>{staff.fullName || staff.name || `Staff #${currentStaffId}`}</div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {currentStaffId}</span>
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
                  <th className="px-4 py-3">{t("manager.customer_name_or_code", "Mã KH / Họ tên")}</th>
                  <th className="px-4 py-3">{t("common.phone", "Số điện thoại")}</th>
                  <th className="px-4 py-3">{t("common.email", "Email")}</th>
                  <th className="px-4 py-3">{t("manager.unit_in_use", "Ô kho sử dụng")}</th>
                  <th className="px-4 py-3">{t("manager.agreements", "Hợp đồng")}</th>
                  <th className="px-4 py-3 text-center">{t("common.status", "Trạng thái")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      {t("manager.loading_customers", "Đang tải danh sách khách hàng...")}
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      {t("manager.no_customers", "Không có khách hàng nào phù hợp.")}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cus, idx) => {
                    const cusId = cus.customerId ?? cus.id ?? idx;
                    const hasActiveRentals = (cus.activeAgreements ?? 0) > 0 || cus.status === "active";
                    return (
                      <tr key={cusId} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                              {(cus.fullName || "K").charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div>{cus.fullName || `Khách hàng #${cusId}`}</div>
                              <span className="text-[10px] text-slate-400 font-mono">{cus.customerCode || `#CUS-${cusId}`}</span>
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
                          <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {cus.unitCode ? `Kho ${cus.unitCode}` : (cus.activeAgreements > 0 ? `${cus.activeAgreements} kho đang thuê` : "Chưa có kho")}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-mono font-medium text-slate-700">
                          {cus.agreementNo || `${cus.activeAgreements ?? 0} đang hoạt động (${cus.totalAgreements ?? 0} tổng)`}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                            hasActiveRentals
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {cus.status || (hasActiveRentals ? "Đang thuê" : "Đã trả kho")}
                          </span>
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
                {staffModalMode === "create" ? t("manager.add_employee", "Thêm nhân viên") : t("manager.edit_employee", "Chỉnh sửa nhân viên")}
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              {staffModalMode === "create" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mật khẩu ban đầu *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Nhân viên sẽ dùng mật khẩu này để đăng nhập lần đầu.</p>
                </div>
              )}

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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vị trí / Chức vụ *
                </label>
                <SelectDropdown
                  value={staffFormData.position}
                  onChange={(e) => setStaffFormData({ ...staffFormData, position: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
                >
                  {STAFF_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </SelectDropdown>
              </div>

              {/* Checkbox Active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="staff-active-check"
                  checked={staffFormData.isActive}
                  onChange={(e) => setStaffFormData({ ...staffFormData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
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
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-1.5 font-bold text-white shadow-xs transition disabled:opacity-50"
                >
                  <span>{staffSubmitting ? t("common.saving", "Đang lưu...") : staffModalMode === "create" ? t("manager.add_employee", "Thêm nhân viên") : t("common.save", "Lưu thay đổi")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

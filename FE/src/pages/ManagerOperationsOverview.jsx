import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";

const STATUS_BADGE = {
  paid: "bg-[#e7f8ee] text-[#0e7b4c]",
  open: "bg-[#eef4ff] text-[#1d5fe5]",
  partially_paid: "bg-[#fff2d8] text-[#a15c00]",
  overdue: "bg-[#fdecec] text-[#c0362c]",
  draft: "bg-[#f0f3fa] text-[#58657a]",
  voided: "bg-[#f2f4f8] text-[#8996a9] line-through",
};

const STATUS_LABEL = {
  paid: "Đã thu",
  open: "Chờ thanh toán",
  partially_paid: "Thu một phần",
  overdue: "Quá hạn",
  draft: "Nháp",
  voided: "Đã hủy",
};

const LINE_TYPE_LABEL = {
  rent: "Tiền thuê kho",
  deposit: "Tiền đặt cọc",
  renewal: "Gia hạn hợp đồng",
  late_fee: "Phí phạt trễ hạn",
  damage: "Phí đền bù hư hại",
  maintenance: "Phí bảo trì",
  booking_fee: "Phí giữ chỗ",
  other: "Khoản thu khác",
};

function formatVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

function ManagerOperationsOverview() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [kpis, setKpis] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryMix, setCategoryMix] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Invoice Modal State (Create / Edit)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: "",
    agreementId: "",
    reservationId: "",
    billingPeriod: new Date().toISOString().slice(0, 7),
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    lineType: "rent",
    description: "",
    amount: 2500000,
    discountAmount: 0,
    taxAmount: 0,
    paidAmount: 0,
    status: "paid",
    paymentMethod: "bank_transfer",
  });

  // Promotion Modal State (Create / Edit)
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: 500000,
    usageLimit: 100,
    isActive: true,
  });

  const [facilityId, setFacilityId] = useState(1);
  const [facilities, setFacilities] = useState([]);
  const [dailySchedule, setDailySchedule] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch real facility dashboard KPIs (Swagger API #21: GET /manager/facilities/{facilityId}/dashboard)
      let dashboardKpis = null;
      try {
        const dashRes = await managerService.getFacilityDashboard(facilityId);
        if (dashRes?.data) {
          dashboardKpis = dashRes.data;
          setDailySchedule(dashRes.data.dailySchedule || null);
        }
      } catch (dashErr) {
        console.warn("Could not load facility dashboard:", dashErr);
      }

      // 2. Fetch revenue overview & invoices list
      const res = await managerService.getRevenueOverview(facilityId);
      const data = res?.data;
      if (data) {
        const mergedKpis = {
          ...data.kpis,
          totalRevenuePaid: dashboardKpis?.thisMonthRevenue || data.kpis?.totalRevenuePaid,
          openReceivablesAmount: dashboardKpis?.totalOutstandingDebt || data.kpis?.openReceivablesAmount,
          occupancyRatePercent: dashboardKpis?.occupancyRate || data.kpis?.occupancyRatePercent,
        };
        setKpis(mergedKpis);
        setMonthlyTrend(data.monthlyTrend || []);
        setCategoryMix(data.categoryMix || []);
        setInvoices(data.invoices || []);
        setPromotions(data.promotions || []);
        setCustomerOptions(data.customerOptions || []);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Không thể tải dữ liệu doanh thu từ SQL Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initFacilities() {
      try {
        const facRes = await managerService.getFacilities();
        if (Array.isArray(facRes?.data) && facRes.data.length > 0) {
          setFacilities(facRes.data);
          setFacilityId((prev) => (prev ? prev : facRes.data[0].id));
        }
      } catch (err) {
        console.warn("Could not load facilities:", err);
      }
    }
    initFacilities();
  }, []);

  useEffect(() => {
    loadData();
  }, [facilityId]);

  const showToast = (msg) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(""), 4000);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          (inv.invoiceNo || "").toLowerCase().includes(q) ||
          (inv.customerName || "").toLowerCase().includes(q) ||
          (inv.customerEmail || "").toLowerCase().includes(q) ||
          (inv.description || "").toLowerCase().includes(q) ||
          (inv.unitCode || "").toLowerCase().includes(q) ||
          (inv.billingPeriod || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  const openCreateInvoiceModal = () => {
    const defaultCust = customerOptions[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    setEditingInvoice(null);
    setInvoiceForm({
      customerId: defaultCust?.customerId || "",
      agreementId: defaultCust?.agreementId || "",
      reservationId: defaultCust?.reservationId || "",
      billingPeriod: todayStr.slice(0, 7),
      issueDate: todayStr,
      dueDate: nextWeekStr,
      lineType: "rent",
      description: defaultCust?.unitCode ? `Thu tiền thuê kho định kỳ (${defaultCust.unitCode})` : "",
      amount: 2500000,
      discountAmount: 0,
      taxAmount: 0,
      paidAmount: 2500000,
      status: "paid",
      paymentMethod: "bank_transfer",
    });
    setInvoiceModalOpen(true);
  };

  const openEditInvoiceModal = (inv) => {
    setEditingInvoice(inv);
    setInvoiceForm({
      customerId: inv.customerId,
      agreementId: inv.agreementId || "",
      reservationId: inv.reservationId || "",
      billingPeriod: inv.billingPeriod || new Date().toISOString().slice(0, 7),
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      lineType: inv.lineType || "rent",
      description: inv.description || "",
      amount: inv.subtotalAmount,
      discountAmount: inv.discountAmount || 0,
      taxAmount: inv.taxAmount || 0,
      paidAmount: inv.paidAmount || 0,
      status: inv.status,
      paymentMethod: inv.paymentMethod || "bank_transfer",
    });
    setInvoiceModalOpen(true);
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.customerId) {
      setErrorMsg("Vui lòng chọn khách hàng trước khi lưu hóa đơn.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const selectedCust = customerOptions.find((c) => Number(c.customerId) === Number(invoiceForm.customerId));
      const payload = {
        customerId: Number(invoiceForm.customerId),
        agreementId: invoiceForm.agreementId ? Number(invoiceForm.agreementId) : selectedCust?.agreementId || null,
        reservationId: invoiceForm.reservationId ? Number(invoiceForm.reservationId) : selectedCust?.reservationId || null,
        billingPeriod: invoiceForm.billingPeriod,
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        lineType: invoiceForm.lineType,
        description: invoiceForm.description,
        amount: Number(invoiceForm.amount),
        discountAmount: Number(invoiceForm.discountAmount || 0),
        taxAmount: Number(invoiceForm.taxAmount || 0),
        paidAmount: invoiceForm.status === "paid" ? Number(invoiceForm.amount) - Number(invoiceForm.discountAmount || 0) + Number(invoiceForm.taxAmount || 0) : Number(invoiceForm.paidAmount || 0),
        status: invoiceForm.status,
        paymentMethod: invoiceForm.paymentMethod,
      };

      if (editingInvoice) {
        await managerService.updateInvoice(editingInvoice.id, payload);
        showToast(`Đã cập nhật hóa đơn ${editingInvoice.invoiceNo} trong Database!`);
      } else {
        const res = await managerService.createInvoice(payload);
        showToast(`Đã thêm khoản thu mới (${res?.data?.invoiceNo || "INV"}) vào Database!`);
      }
      setInvoiceModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi khi lưu hóa đơn doanh thu.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickMarkPaid = async (inv) => {
    setSaving(true);
    setErrorMsg("");
    try {
      await managerService.updateInvoice(inv.id, {
        customerId: inv.customerId,
        agreementId: inv.agreementId,
        reservationId: inv.reservationId,
        billingPeriod: inv.billingPeriod,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        lineType: inv.lineType || "rent",
        description: inv.description,
        amount: inv.subtotalAmount,
        discountAmount: inv.discountAmount,
        taxAmount: inv.taxAmount,
        paidAmount: inv.totalAmount,
        status: "paid",
        paymentMethod: inv.paymentMethod || "bank_transfer",
      });
      showToast(`Đã ghi nhận thu đủ tiền hóa đơn ${inv.invoiceNo} vào Database!`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể cập nhật trạng thái hóa đơn.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvoice = async (inv) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hóa đơn doanh thu ${inv.invoiceNo} (${formatVnd(inv.totalAmount)}) khỏi Database?`)) {
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      await managerService.deleteInvoice(inv.id);
      showToast(`Đã xóa hóa đơn ${inv.invoiceNo} khỏi Database.`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi khi xóa hóa đơn.");
    } finally {
      setSaving(false);
    }
  };

  // Promotion CRUD handlers
  const openCreatePromoModal = () => {
    setEditingPromo(null);
    setPromoForm({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      maxDiscountAmount: 500000,
      usageLimit: 100,
      isActive: true,
    });
    setPromoModalOpen(true);
  };

  const openEditPromoModal = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      name: promo.name,
      description: promo.description || "",
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscountAmount: promo.maxDiscountAmount || "",
      usageLimit: promo.usageLimit || "",
      isActive: promo.isActive,
    });
    setPromoModalOpen(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        code: promoForm.code,
        name: promoForm.name,
        description: promoForm.description,
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue),
        maxDiscountAmount: promoForm.maxDiscountAmount ? Number(promoForm.maxDiscountAmount) : null,
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null,
        isActive: promoForm.isActive,
      };
      if (editingPromo) {
        await managerService.updatePromotion(editingPromo.id, payload);
        showToast(`Đã cập nhật mã khuyến mãi ${promoForm.code} trong Database!`);
      } else {
        await managerService.createPromotion(payload);
        showToast(`Đã tạo mã khuyến mãi ${promoForm.code} vào Database!`);
      }
      setPromoModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Lỗi khi lưu mã khuyến mãi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Xóa mã khuyến mãi ${promo.code} khỏi Database?`)) return;
    setSaving(true);
    try {
      await managerService.deletePromotion(promo.id);
      showToast(`Đã xóa mã khuyến mãi ${promo.code} khỏi Database.`);
      await loadData();
    } catch (err) {
      setErrorMsg(err?.message || "Không thể xóa mã khuyến mãi.");
    } finally {
      setSaving(false);
    }
  };

  const maxTrendValue = useMemo(() => {
    const vals = monthlyTrend.map((m) => Number(m.totalRevenue || 0));
    return Math.max(...vals, 5000000);
  }, [monthlyTrend]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold">Doanh Thu &amp; Hóa Đơn</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4a0]" />
            Live
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]">
            <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">domain</span>
            <span>Cơ sở:</span>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(Number(e.target.value))}
              className="bg-transparent font-bold text-[#1d5fe5] outline-none"
            >
              {facilities.length === 0 ? (
                <option value={facilityId}>Cơ sở {facilityId}</option>
              ) : (
                facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-bold text-[#3a475a] hover:bg-[#f5f7fd]"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            Làm mới
          </button>
          <button
            onClick={openCreateInvoiceModal}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3.5 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#1649b8]"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            Thêm hóa đơn
          </button>
        </div>
      </div>

      {/* Daily Schedule Banner from Swagger API #21 */}
      {dailySchedule && (
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-[10px] border border-[#d6e4ff] bg-[#f0f5ff] px-4 py-2 text-[11px] font-semibold text-[#1d5fe5]">
          <span className="flex items-center gap-1 font-bold text-[#0b1c30]">
            <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">event_note</span>
            Lịch hoạt động hôm nay:
          </span>
          <span>Check-in mới: <b className="text-[#0e7b4c]">{dailySchedule.todayCheckInsCount ?? 0}</b></span>
          <span>•</span>
          <span>Check-out trả kho: <b className="text-[#a15c00]">{dailySchedule.todayCheckOutsCount ?? 0}</b></span>
          <span>•</span>
          <span>Cần kiểm tra ô kho: <b className="text-[#1d5fe5]">{dailySchedule.todayInspectionsCount ?? 0}</b></span>
        </div>
      )}

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

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Doanh Thu Đã Thu
            <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">payments</span>
          </div>
          <div className="mt-1 text-[18px] font-bold text-[#0e7b4c]">
            {kpis ? formatVnd(kpis.totalRevenuePaid) : "..."}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Công Nợ Chờ Thu
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">account_balance_wallet</span>
          </div>
          <div className="mt-1 text-[18px] font-bold text-[#1d5fe5]">
            {kpis ? formatVnd(kpis.openReceivablesAmount) : "..."}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Hóa Đơn Quá Hạn
            <span className="material-symbols-outlined text-[14px] text-[#e5484d]">warning</span>
          </div>
          <div className="mt-1 text-[18px] font-bold text-[#c0362c]">
            {kpis ? `${kpis.overdueInvoicesCount} đơn` : "..."}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dfe7f5] bg-white p-3.5 shadow-[0_6px_16px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Tỷ Lệ Lấp Đầy Kho
            <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">warehouse</span>
          </div>
          <div className="mt-1 text-[18px] font-bold">
            {kpis ? `${kpis.occupancyRatePercent}%` : "..."}
          </div>
        </div>
      </div>

      {/* Revenue Table (Primary Manager Section) */}
      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold">Hóa Đơn &amp; Khoản Thu</span>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
              {filteredInvoices.length} bản ghi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#8996a9]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã HĐ, tên KH, mô tả..."
                className="w-48 bg-transparent text-[11px] outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[8px] border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3a475a]"
            >
              <option value="all">Tất cả trạng thái ({invoices.length})</option>
              <option value="paid">Đã thu</option>
              <option value="open">Chờ thanh toán</option>
              <option value="overdue">Quá hạn</option>
              <option value="partially_paid">Thu một phần</option>
              <option value="draft">Nháp</option>
              <option value="voided">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2.5 pr-2">Mã Hóa Đơn</th>
                <th className="py-2.5 pr-2">Khách Hàng / Hợp Đồng</th>
                <th className="py-2.5 pr-2">Loại Thu &amp; Nội Dung</th>
                <th className="py-2.5 pr-2">Kỳ Thu / Hạn TT</th>
                <th className="py-2.5 pr-2 text-right">Tổng Tiền</th>
                <th className="py-2.5 pr-2 text-right">Đã Thu</th>
                <th className="py-2.5 pr-2 text-center">Trạng Thái</th>
                <th className="py-2.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[11px] text-[#8996a9]">
                    Đang tải dữ liệu doanh thu từ SQL Server...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[11px] text-[#8996a9]">
                    Không có hóa đơn doanh thu nào khớp bộ lọc. Hãy nhấn &quot;+ Thêm Khoản Thu / Hóa Đơn Mới&quot;.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#f2f5fb] hover:bg-[#f8faff]">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-[#1d5fe5]">{inv.invoiceNo}</div>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-[#0b1c30]">{inv.customerName}</div>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-[#3a475a]">{inv.description}</div>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-[#3a475a]">Kỳ: {inv.billingPeriod || "N/A"} • Hạn: {inv.dueDate}</div>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-bold text-[#0b1c30]">
                      {formatVnd(inv.totalAmount)}
                    </td>
                    <td className="py-2.5 pr-2 text-right font-semibold text-[#0e7b4c]">
                      {formatVnd(inv.paidAmount)}
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold ${STATUS_BADGE[inv.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {inv.status !== "paid" && inv.status !== "voided" && (
                          <button
                            onClick={() => handleQuickMarkPaid(inv)}
                            disabled={saving}
                            title="Ghi nhận đã thu đủ tiền"
                            className="rounded-[6px] bg-[#e7f8ee] px-2 py-1 text-[10px] font-bold text-[#0e7b4c] hover:bg-[#d0f2de]"
                          >
                            Thu tiền
                          </button>
                        )}
                        <button
                          onClick={() => openEditInvoiceModal(inv)}
                          className="rounded-[6px] border border-[#dfe7f5] bg-white px-2 py-1 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          disabled={saving}
                          className="rounded-[6px] border border-[#f5d0d0] bg-[#fdf4f4] px-2 py-1 text-[10px] font-bold text-[#c0362c] hover:bg-[#fbe4e4]"
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

      {/* 6-Month Chart & Category Revenue Mix */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[14px] font-bold">Doanh Thu 6 Tháng Gần Nhất</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-[#1d5fe5]" /> Cơ sở Thủ Đức (HCM)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-[#93b4f8]" /> Cơ sở Cầu Giấy (HN)
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-[170px] items-end justify-between gap-3 border-b border-[#eef1f8] px-3 pb-2">
            {monthlyTrend.map((pt) => {
              const h1 = Math.round((Number(pt.primaryFacilityRevenue || 0) / maxTrendValue) * 140);
              const h2 = Math.round((Number(pt.otherFacilitiesRevenue || 0) / maxTrendValue) * 140);
              return (
                <div key={pt.monthKey} className="flex flex-1 flex-col items-center justify-end">
                  <div className="mb-1 text-[9px] font-bold text-[#3a475a]">
                    {pt.totalRevenue > 0 ? `${(pt.totalRevenue / 1000000).toFixed(1)}M` : "0"}
                  </div>
                  <div className="flex w-9 flex-col-reverse overflow-hidden rounded-t-[5px] bg-[#f5f7fd]">
                    <div className="w-full bg-[#1d5fe5] transition-all" style={{ height: `${Math.max(h1, pt.primaryFacilityRevenue > 0 ? 8 : 2)}px` }} />
                    <div className="w-full bg-[#93b4f8] transition-all" style={{ height: `${Math.max(h2, pt.otherFacilitiesRevenue > 0 ? 6 : 0)}px` }} />
                  </div>
                  <div className="mt-1.5 text-[10px] font-semibold text-[#58657a]">{pt.monthLabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="text-[14px] font-bold">Cơ Cấu Doanh Thu Theo Loại Kho</div>
          <p className="text-[10px] text-[#8996a9]">Hiệu suất khai thác theo từng nhóm diện tích</p>

          <div className="mt-3 space-y-3">
            {categoryMix.map((cat) => (
              <div key={cat.unitTypeId}>
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#3a475a]">
                  <span>
                    {cat.unitTypeCode} — {cat.unitTypeName} ({cat.unitCount} kho)
                  </span>
                  <span className="font-bold text-[#1d5fe5]">
                    {cat.sharePercent}% • {formatVnd(cat.revenueAmount)}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[#f0f3fa]">
                  <div
                    className="h-2 rounded-full bg-[#1d5fe5]"
                    style={{ width: `${Math.min(100, Math.max(5, cat.sharePercent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotions / Vouchers */}
      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[14px] font-bold">Mã Khuyến Mãi &amp; Vouchers</div>
            <p className="text-[10px] text-[#8996a9]">Áp dụng trực tiếp khi khách thanh toán</p>
          </div>
          <button
            onClick={openCreatePromoModal}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#1649b8]"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Thêm mã
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-[10px] border border-[#eef1f8] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#1d5fe5]">{promo.code}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    promo.isActive ? "bg-[#e7f8ee] text-[#0e7b4c]" : "bg-[#f2f4f8] text-[#8996a9]"
                  }`}
                >
                  {promo.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                </span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-[#0b1c30]">{promo.name}</div>
              <div className="mt-0.5 text-[10px] text-[#58657a]">{promo.description}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-[#3a475a]">
                <span>
                  Giảm:{" "}
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}%`
                    : formatVnd(promo.discountValue)}
                </span>
                <span>
                  Đã dùng: {promo.usedCount}/{promo.usageLimit || "∞"}
                </span>
              </div>
              <div className="mt-2.5 flex justify-end gap-1.5 border-t border-[#eef1f8] pt-2">
                <button
                  onClick={() => openEditPromoModal(promo)}
                  className="rounded-[6px] border border-[#dfe7f5] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeletePromo(promo)}
                  className="rounded-[6px] border border-[#f5d0d0] bg-[#fdf4f4] px-2.5 py-1 text-[10px] font-bold text-[#c0362c] hover:bg-[#fbe4e4]"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INVOICE CREATE / EDIT MODAL */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[560px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                {editingInvoice ? `Chỉnh sửa Hóa đơn ${editingInvoice.invoiceNo}` : "Thêm Khoản Thu / Hóa Đơn Mới"}
              </h2>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="text-[#8996a9] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Khách hàng *</span>
                  <select
                    required
                    value={invoiceForm.customerId}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      const cust = customerOptions.find((c) => Number(c.customerId) === cid);
                      setInvoiceForm((prev) => ({
                        ...prev,
                        customerId: cid,
                        agreementId: cust?.agreementId || "",
                        reservationId: cust?.reservationId || "",
                      }));
                    }}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customerOptions.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.fullName} ({c.email}) {c.unitCode ? `• Kho ${c.unitCode}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Loại khoản thu *</span>
                  <select
                    value={invoiceForm.lineType}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, lineType: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    {Object.entries(LINE_TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Nội dung / Mô tả khoản thu *</span>
                <input
                  required
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="VD: Tiền thuê kho A-101 kỳ tháng 10/2026"
                  className="rounded-[8px] border border-[#dfe7f5] px-3 py-2"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Kỳ thanh toán (YYYY-MM)</span>
                  <input
                    value={invoiceForm.billingPeriod}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, billingPeriod: e.target.value }))}
                    placeholder="2026-10"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Ngày phát hành</span>
                  <input
                    type="date"
                    required
                    value={invoiceForm.issueDate}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Hạn thanh toán</span>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Số tiền gốc (VNĐ) *</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setInvoiceForm((prev) => ({
                        ...prev,
                        amount: val,
                        paidAmount: prev.status === "paid" ? Math.max(0, val - Number(prev.discountAmount || 0) + Number(prev.taxAmount || 0)) : prev.paidAmount,
                      }));
                    }}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold text-[#0b1c30]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Chiết khấu (VNĐ)</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={invoiceForm.discountAmount}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, discountAmount: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Thuế VAT (VNĐ)</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={invoiceForm.taxAmount}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, taxAmount: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Trạng thái hóa đơn *</span>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) => {
                      const st = e.target.value;
                      const netTotal = Math.max(0, Number(invoiceForm.amount || 0) - Number(invoiceForm.discountAmount || 0) + Number(invoiceForm.taxAmount || 0));
                      setInvoiceForm((prev) => ({
                        ...prev,
                        status: st,
                        paidAmount: st === "paid" ? netTotal : st === "open" || st === "overdue" || st === "draft" || st === "voided" ? 0 : prev.paidAmount,
                      }));
                    }}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Số tiền đã thu (VNĐ)</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={invoiceForm.paidAmount}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold text-[#0e7b4c]"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Phương thức thanh toán</span>
                  <select
                    value={invoiceForm.paymentMethod}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    <option value="bank_transfer">Chuyển khoản (VietQR / SePay)</option>
                    <option value="cash">Tiền mặt tại quầy (Cash)</option>
                    <option value="vnpay">VNPay</option>
                    <option value="payos">PayOS</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[8px] bg-[#1d5fe5] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#1649b8] disabled:opacity-60"
                >
                  {saving ? "Đang lưu vào DB..." : editingInvoice ? "Lưu Cập Nhật" : "Tạo Hóa Đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION CREATE / EDIT MODAL */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f8] pb-3">
              <h2 className="text-[15px] font-bold text-[#0b1c30]">
                {editingPromo ? `Sửa Mã Khuyến Mãi ${editingPromo.code}` : "Thêm Mã Khuyến Mãi Mới"}
              </h2>
              <button onClick={() => setPromoModalOpen(false)} className="text-[#8996a9]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="mt-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Mã Code *</span>
                  <input
                    required
                    value={promoForm.code}
                    onChange={(e) => setPromoForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: SUMMER20"
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold uppercase"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Loại giảm giá</span>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm((p) => ({ ...p, discountType: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-semibold"
                  >
                    <option value="percentage">Theo % (Percentage)</option>
                    <option value="fixed">Số tiền cố định (Fixed VNĐ)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Tên chương trình *</span>
                <input
                  required
                  value={promoForm.name}
                  onChange={(e) => setPromoForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Ưu đãi thuê kho mùa hè"
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-[#3a475a]">Mô tả</span>
                <input
                  value={promoForm.description}
                  onChange={(e) => setPromoForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Áp dụng cho hợp đồng từ 1 tháng"
                  className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Giá trị giảm *</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm((p) => ({ ...p, discountValue: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2 font-bold"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-bold text-[#3a475a]">Giới hạn lượt dùng</span>
                  <input
                    type="number"
                    min="1"
                    value={promoForm.usageLimit}
                    onChange={(e) => setPromoForm((p) => ({ ...p, usageLimit: e.target.value }))}
                    className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-2"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 pt-1 font-semibold text-[#3a475a]">
                <input
                  type="checkbox"
                  checked={promoForm.isActive}
                  onChange={(e) => setPromoForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-[#1d5fe5]"
                />
                Kích hoạt mã khuyến mãi ngay
              </label>

              <div className="flex justify-end gap-2 border-t border-[#eef1f8] pt-3">
                <button
                  type="button"
                  onClick={() => setPromoModalOpen(false)}
                  className="rounded-[8px] border border-[#dfe7f5] px-4 py-2 font-bold text-[#58657a]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[8px] bg-[#1d5fe5] px-5 py-2 font-bold text-white"
                >
                  {saving ? "Đang lưu..." : "Lưu Mã Khuyến Mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerOperationsOverview;

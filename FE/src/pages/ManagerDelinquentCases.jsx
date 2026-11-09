import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { TableSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseActionDetails(details) {
  if (!details) return "";
  try {
    const parsed = typeof details === "string" ? JSON.parse(details) : details;
    if (parsed && typeof parsed === "object") {
      const note = parsed.note ?? parsed.details ?? "";
      return typeof note === "string" ? note.trim() : "";
    }
    return String(details).trim();
  } catch {
    if (typeof details === "string" && details.startsWith("{") && details.endsWith("}")) {
      return "";
    }
    return String(details).trim();
  }
}

const STATUS_CONFIG = {
  delinquent: {
    label: "Nợ quá hạn (Khóa kho)",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
  grace: {
    label: "Trong thời gian ân hạn",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  cured: {
    label: "Đã tất toán / Khắc phục",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  waived: {
    label: "Đã miễn giảm nợ",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-500",
  },
  termination_started: {
    label: "Đang thanh lý hợp đồng",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    dotClass: "bg-purple-500",
  },
};

const ACTION_TYPE_OPTIONS = [
  { value: "credential_suspended", label: "Tạm khóa mã PIN & quyền ra vào kho" },
  { value: "reminder_sent", label: "Gửi thông báo nhắc nợ thanh toán" },
  { value: "customer_contacted", label: "Đã gọi điện / trao đổi với khách" },
  { value: "payment_plan", label: "Thống nhất lịch hẹn thanh toán / gia hạn" },
  { value: "late_fee_added", label: "Áp dụng phí phạt chậm thanh toán" },
  { value: "waived", label: "Miễn giảm công nợ cho khách" },
  { value: "termination_started", label: "Bắt đầu thủ tục đơn phương thanh lý HĐ" },
  { value: "note", label: "Ghi chú theo dõi nội bộ" },
];

const CASE_STATUS_OPTIONS = [
  { value: "", label: "-- Giữ nguyên trạng thái hiện tại --" },
  { value: "delinquent", label: "Nợ quá hạn / Tạm khóa kho (Delinquent)" },
  { value: "grace", label: "Trong thời gian ân hạn (Grace Period)" },
  { value: "cured", label: "Đã tất toán nợ / Khôi phục quyền (Cured)" },
  { value: "waived", label: "Đã miễn giảm công nợ (Waived)" },
  { value: "termination_started", label: "Bắt đầu thanh lý hợp đồng (Termination)" },
];

function ManagerDelinquentCases() {
  const { t } = useLanguage();
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedAgreement, setCopiedAgreement] = useState("");

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await managerService.getDelinquentCases(facilityId);
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách hồ sơ nợ quá hạn.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) {
      setLoading(false);
    } else if (facilityId) {
      load();
    }
  }, [facilityId, facilityLoading]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function submitAction(id) {
    const draft = drafts[id] || {};
    if (!draft.actionType) {
      setError("Vui lòng chọn Hành động xử lý trước khi lưu.");
      return;
    }
    setSubmittingId(id);
    setError("");
    setNotice("");
    try {
      await managerService.createDelinquentCaseAction(id, {
        actionType: draft.actionType,
        note: draft.note || undefined,
        updateCaseStatus: draft.updateCaseStatus || undefined,
      });
      setNotice("Đã ghi nhận biện pháp xử lý và cập nhật trạng thái hồ sơ thành công.");
      setDrafts((prev) => ({ ...prev, [id]: {} }));
      await load();
    } catch (err) {
      setError(err?.message || "Không thể ghi nhận biện pháp xử lý. Vui lòng thử lại.");
    } finally {
      setSubmittingId(null);
    }
  }

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedAgreement(text);
    setTimeout(() => setCopiedAgreement(""), 2000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = cases.length;
    const totalDebt = cases.reduce((acc, c) => acc + (Number(c.currentDebt) || 0), 0);
    const delinquentCount = cases.filter((c) => c.status === "delinquent").length;
    const graceCount = cases.filter((c) => c.status === "grace").length;
    const curedCount = cases.filter((c) => c.status === "cured").length;
    return { totalCount, totalDebt, delinquentCount, graceCount, curedCount };
  }, [cases]);

  // Filtered List
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = (item.customerName || "").toLowerCase().includes(query);
        const agrMatch = (item.agreementNo || "").toLowerCase().includes(query);
        const unitMatch = (item.unitCode || "").toLowerCase().includes(query);
        const phoneMatch = (item.customerPhone || "").toLowerCase().includes(query);
        return nameMatch || agrMatch || unitMatch || phoneMatch;
      }
      return true;
    });
  }, [cases, statusFilter, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Page Title & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t("manager.delinquent", "Xử lý nợ quá hạn & Khóa kho")}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý thu hồi công nợ, ghi nhận biên bản liên hệ, tạm khóa mã PIN mở kho hoặc đơn phương thanh lý hợp đồng.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng hồ sơ nợ</span>
            <span className="material-symbols-outlined text-[20px] text-blue-500">rule_folder</span>
          </div>
          <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">
            {stats.totalCount}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-semibold">Tổng nợ tồn đọng</span>
            <span className="material-symbols-outlined text-[20px] text-rose-500">payments</span>
          </div>
          <div className="mt-1.5 text-2xl font-black tracking-tight text-rose-700">
            {formatVnd(stats.totalDebt)}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold">Đang ân hạn (Grace)</span>
            <span className="material-symbols-outlined text-[20px] text-amber-500">hourglass_top</span>
          </div>
          <div className="mt-1.5 text-2xl font-black tracking-tight text-amber-800">
            {stats.graceCount}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Nợ xấu / Khóa kho</span>
            <span className="material-symbols-outlined text-[20px] text-rose-600">lock</span>
          </div>
          <div className="mt-1.5 text-2xl font-black tracking-tight text-rose-600">
            {stats.delinquentCount}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {notice && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-rose-600 hover:text-rose-800"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên khách, mã hợp đồng (#AGR...), mã kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("delinquent")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              statusFilter === "delinquent"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Khóa kho ({stats.delinquentCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("grace")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              statusFilter === "grace"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Đang ân hạn ({stats.graceCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("cured")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              statusFilter === "cured"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Đã giải quyết ({stats.curedCount})
          </button>
        </div>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            icon="rule_folder"
            title="Không tìm thấy hồ sơ nợ quá hạn nào"
            description="Tất cả khách hàng phù hợp với bộ lọc hiện đang thanh toán đúng hạn hoặc không có công nợ tồn đọng."
          />
        ) : (
          filteredCases.map((item) => {
            const draft = drafts[item.id] || {};
            const expanded = expandedId === item.id;
            const statusMeta = STATUS_CONFIG[item.status] || {
              label: item.status,
              badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
              dotClass: "bg-slate-400",
            };

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-slate-300 sm:p-6"
              >
                {/* Header row: Customer name, Unit, Agreement & Status */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      {item.customerName ? item.customerName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{item.customerName}</span>
                        {item.customerPhone && (
                          <a
                            href={`tel:${item.customerPhone}`}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
                          >
                            <span className="material-symbols-outlined text-[13px] text-slate-500">call</span>
                            {item.customerPhone}
                          </a>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {/* Unit Badge */}
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 font-bold text-indigo-700">
                          <span className="material-symbols-outlined text-[14px]">warehouse</span>
                          Kho {item.unitCode || "—"}
                        </span>

                        <span>•</span>

                        {/* Agreement No */}
                        <span className="font-mono text-slate-700 font-semibold">
                          #{item.agreementNo}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.agreementNo)}
                          className="text-slate-400 hover:text-slate-600 transition"
                          title="Sao chép mã hợp đồng"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedAgreement === item.agreementNo ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.badgeClass}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                    <span>{statusMeta.label}</span>
                  </span>
                </div>

                {/* Metrics 3-Col Box */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {/* Metric 1: Overdue Days */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                      Thời gian quá hạn:
                    </span>
                    <div className="mt-1">
                      {item.overdueDays > 0 ? (
                        <span className="text-sm font-bold text-rose-600">
                          Quá hạn {item.overdueDays} ngày
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-700">
                          0 ngày (Trong hạn ân hạn)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric 2: Current Debt */}
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                    <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-rose-500">payments</span>
                      Tổng công nợ tồn đọng:
                    </span>
                    <div className="mt-1 text-base font-extrabold text-rose-700">
                      {formatVnd(item.currentDebt || item.outstandingSnapshot)}
                    </div>
                  </div>

                  {/* Metric 3: Grace Period Ends */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">event_available</span>
                      Hạn chót ân hạn (Grace Ends):
                    </span>
                    <div className="mt-1 text-xs font-bold text-slate-800">
                      {formatDateTime(item.graceEndsAt)}
                    </div>
                  </div>
                </div>

                {/* Collapsible Action History Toggle */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>
                      {expanded ? "Thu gọn nhật ký xử lý" : `Xem lịch sử xử lý (${item.actions?.length ?? 0})`}
                    </span>
                    <span className={`material-symbols-outlined text-[16px] transition-transform ${expanded ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                </div>

                {/* Action History Timeline */}
                {expanded && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {(item.actions ?? []).length === 0 ? (
                      <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
                        Chưa có lịch sử xử lý nợ nào được ghi nhận cho hồ sơ này.
                      </p>
                    ) : (
                      item.actions.map((action) => {
                        const noteContent = parseActionDetails(action.details);
                        const actionMeta = ACTION_TYPE_OPTIONS.find((opt) => opt.value === action.actionType);

                        return (
                          <div
                            key={action.id}
                            className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-slate-900">
                                {actionMeta ? actionMeta.label : action.actionType}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                bởi <strong className="text-slate-600">{action.performedByName || "Hệ thống"}</strong> • {formatDateTime(action.occurredAt)}
                              </span>
                            </div>
                            {noteContent ? (
                              <div className="mt-2 text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/70">
                                {noteContent}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Form Ghi nhận hành động mới */}
                {item.status !== "cured" && item.status !== "waived" && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ghi nhận biện pháp xử lý & Cập nhật trạng thái kho
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Action Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Hành động xử lý <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={draft.actionType || ""}
                            onChange={(e) => updateDraft(item.id, "actionType", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
                          >
                            <option value="" disabled>-- Chọn biện pháp xử lý --</option>
                            {ACTION_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Update Case Status */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Cập nhật trạng thái hồ sơ (tùy chọn)
                        </label>
                        <div className="relative">
                          <select
                            value={draft.updateCaseStatus || ""}
                            onChange={(e) => updateDraft(item.id, "updateCaseStatus", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
                          >
                            {CASE_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ghi chú chi tiết / Tóm tắt trao đổi
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nhập nội dung cuộc gọi trao đổi với khách hàng, biên bản tạm khóa kho hoặc thỏa thuận hẹn ngày thanh toán..."
                        value={draft.note || ""}
                        onChange={(e) => updateDraft(item.id, "note", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Shortcuts & Submit Action */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500">Phím tắt nhanh:</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraft(item.id, "actionType", "credential_suspended");
                            updateDraft(item.id, "updateCaseStatus", "delinquent");
                            updateDraft(item.id, "note", "Tạm khóa mã PIN và quyền ra vào kho do quá hạn thanh toán.");
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                        >
                          Khóa mã PIN
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraft(item.id, "actionType", "reminder_sent");
                            updateDraft(item.id, "note", "Đã gửi thông báo nhắc nợ thanh toán cước thuê kho.");
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                        >
                          Gửi nhắc nợ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraft(item.id, "actionType", "customer_contacted");
                            updateDraft(item.id, "updateCaseStatus", "cured");
                            updateDraft(item.id, "note", "Khách hàng đã thanh toán đầy đủ công nợ tồn đọng.");
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                        >
                          Đã tất toán nợ
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={submittingId === item.id}
                        onClick={() => submitAction(item.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {submittingId === item.id ? "Đang lưu..." : "Lưu biện pháp xử lý"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ManagerDelinquentCases;

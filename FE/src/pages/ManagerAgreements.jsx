import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { TableSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Link } from "react-router-dom";
import { X, ExternalLink, Clock, FileText, ShieldAlert } from "lucide-react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import PAGINATION from "../constants/pagination";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const d = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  return `${time} · ${d}`;
}

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "overdue" || s === "delinquent") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (s === "terminated" || s === "cancelled") return "bg-slate-100 text-slate-700 border border-slate-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function ManagerAgreements() {
  const { t, formatCurrency, translateStatus } = useLanguage();
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const page = await managerService.getAgreements(facilityId, {
        status: status || undefined,
        search: search || undefined,
        pageSize: PAGINATION.MAX_PAGE_SIZE,
      });
      setAgreements(page?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load agreements list.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoading(false); } else if (facilityId) { load(); }
  }, [facilityId, status, facilityLoading]);

  async function openDetail(id) {
    setDetailId(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await managerService.getAgreementDetail(id));
    } catch (err) {
      setError(err?.message || "Failed to load agreement details.");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{t("manager.agreements", "Quản lý hợp đồng thuê")}</h1>
        <p className="text-xs text-slate-500">Giám sát thông tin hợp đồng, thời hạn thuê, bảng giá và nội quy kho</p>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-none">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") load(); }}
            onBlur={load}
            placeholder="Search agreement # / customer..."
            className="w-64 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <SelectDropdown
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">{t("manager.all_statuses", "Tất cả trạng thái")}</option>
            <option value="active">{t("status.active", "Hiệu lực")}</option>
            <option value="overdue">{t("status.overdue", "Quá hạn")}</option>
            <option value="terminated">{t("status.terminated", "Đã thanh lý")}</option>
            <option value="cancelled">Đã hủy</option>
          </SelectDropdown>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 w-[15%]">Agreement #</th>
                <th className="px-4 py-3 w-[18%]">{t("common.customer", "Khách hàng")}</th>
                <th className="px-4 py-3 w-[10%]">{t("common.unit", "Ô kho")}</th>
                <th className="px-4 py-3 w-[18%]">Term</th>
                <th className="px-4 py-3 w-[13%] text-right">Rent / Mo</th>
                <th className="px-4 py-3 w-[13%] text-right">Balance</th>
                <th className="px-4 py-3 w-[8%] text-center">Status</th>
                <th className="px-4 py-3 w-[12%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <TableSkeleton rows={5} columns={8} />
                    </td>
                  </tr>
                ) : agreements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4">
                      <EmptyState
                        icon="description"
                        title="Không có hợp đồng nào"
                        description="Hiện chưa có hợp đồng thuê nào phù hợp với bộ lọc tìm kiếm tại cơ sở này."
                      />
                    </td>
                  </tr>
              ) : (
                agreements.map((agreement) => (
                  <tr key={agreement.id} className="text-slate-700 transition hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">{agreement.agreementNo}</td>
                    <td className="px-4 py-3">{agreement.customerName}</td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{agreement.unitCode || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatVnd(agreement.monthlyRent)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${agreement.outstandingBalance > 0 ? "text-red-600 font-bold" : "text-slate-500 font-normal"}`}>
                      {formatVnd(agreement.outstandingBalance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${getStatusBadgeClass(agreement.status)}`}>
                        {formatStatusToEnglish(agreement.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetail(agreement.id)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Quick View
                        </button>
                        <Link
                          to={`/manager-agreements/${agreement.id}`}
                          className="rounded-md bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
                          title="Trang chi tiết hợp đồng"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Modal (NO emergency reassignment button) */}
      {detailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="text-blue-600" size={20} />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Hợp đồng: {detail?.agreementNo || detailId}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {detail?.createdAt ? `Lập lúc: ${formatDateTime(detail.createdAt)}` : "Hồ sơ hợp đồng lưu trữ"}
                  </p>
                </div>
                {detail?.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${getStatusBadgeClass(detail.status)}`}>
                    {formatStatusToEnglish(detail.status)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailId(null);
                  setDetail(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[24px] text-blue-600">
                  progress_activity
                </span>
                <span>Đang tải thông tin hợp đồng...</span>
              </div>
            ) : detail ? (
              <div className="space-y-4 text-xs">
                {/* Milestone Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Thời điểm tạo</span>
                    <strong className="text-slate-800">{formatDateTime(detail.createdAt)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ký kết</span>
                    <strong className="text-slate-800">{formatDateTime(detail.signedAt || detail.createdAt)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Thời hạn thuê</span>
                    <strong className="text-slate-800">{formatDate(detail.startDate)} → {formatDate(detail.endDate)}</strong>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("common.customer", "Khách hàng")}</div>
                    <div className="mt-0.5 font-bold text-slate-900">{detail.customerName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{detail.customerEmail || "—"}</div>
                    <div className="text-[11px] text-slate-500">{detail.customerPhone || "—"}</div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("common.unit", "Ô kho & Cơ sở")}</div>
                    <div className="mt-0.5 font-mono font-black text-slate-900 text-sm">
                      {detail.unitCode ? `Kho ${detail.unitCode}` : "Chưa gán kho"}
                    </div>
                    <div className="text-[11px] text-slate-600">{detail.unitTypeName || "Tiêu chuẩn"}</div>
                    <div className="text-[11px] text-slate-400 truncate">{detail.facilityName || `Cơ sở #${detail.facilityId || ""}`}</div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tài chính &amp; Tiền cọc</div>
                    <div className="mt-0.5 font-bold text-slate-900">{formatVnd(detail.monthlyRent)}/tháng</div>
                    <div className="text-[11px] text-emerald-700">Cọc: {formatVnd(detail.depositAmount)}</div>
                    <div className={`text-[11px] font-bold ${detail.totalDebt > 0 ? "text-rose-600" : "text-slate-500 font-normal"}`}>
                      Nợ: {formatVnd(detail.totalDebt || 0)}
                    </div>
                  </div>
                </div>

                {/* Invoices List */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Lịch sử hóa đơn ({detail.invoices?.length || 0})
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {(detail.invoices ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Không có hóa đơn ghi nhận.</p>
                    ) : (
                      detail.invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs">
                          <span className="font-mono font-semibold text-slate-800">
                            {invoice.invoiceNo} <span className="font-normal text-slate-400">· Hạn {formatDate(invoice.dueDate)}</span>
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatVnd(invoice.paidAmount)} / {formatVnd(invoice.totalAmount)}
                            <span className="ml-2 font-semibold capitalize text-[10px] text-slate-500">({formatStatusToEnglish(invoice.status)})</span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stored Inventory Items */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Danh mục đồ vật khai báo ({detail.storedItems?.length || 0})
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {(detail.storedItems ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Khách hàng chưa khai báo danh mục đồ vật chi tiết.</p>
                    ) : (
                      detail.storedItems.map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{item.itemName}</span>
                            <span className="ml-2 text-slate-500 text-[11px]">×{item.quantity} · {item.category}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Rủi ro: {item.riskClassification || "None"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Rules Snapshot */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldAlert size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="block font-bold text-blue-950">Nội quy lưu trữ cốt lõi:</strong>
                    Nghiêm cấm lưu trữ chất dễ cháy nổ, bình gas, vũ khí, hàng lậu, động vật sống hoặc dùng ô kho làm nơi cư trú. Quá hạn thanh toán sau 01 ngày hệ thống sẽ tạm dừng quyền mở cửa kho.
                  </div>
                </div>

                {/* Link to Full Detail Page */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to={`/manager-agreements/${detail.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs shadow-xs transition cursor-pointer"
                  >
                    <span>Xem toàn bộ hợp đồng, điều khoản &amp; nội quy chi tiết</span>
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">Không có dữ liệu hợp đồng.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerAgreements;

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import managerService from "../api/managerService";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import EmergencyReassignModal from "../components/EmergencyReassignModal";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "overdue" || s === "delinquent") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (s === "terminated" || s === "cancelled") return "bg-slate-100 text-slate-700 border border-slate-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

export default function ManagerAgreementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEmergencyReassignOpen, setIsEmergencyReassignOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await managerService.getAgreementDetail(id);
      setAgreement(data);
    } catch (err) {
      setError(err?.message || "Không thể tải chi tiết hợp đồng thuê kho.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#1d5fe5]">
          progress_activity
        </span>
        <span className="text-xs font-semibold text-slate-500">Đang tải chi tiết hợp đồng...</span>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/manager-agreements")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách hợp đồng</span>
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error || "Không tìm thấy thông tin hợp đồng."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/manager-agreements"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
            title="Quay lại danh sách hợp đồng"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Hợp đồng #{agreement.agreementNo || agreement.id}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${getStatusBadgeClass(
                  agreement.status
                )}`}
              >
                {formatStatusToEnglish(agreement.status)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Chi tiết hợp đồng thuê kho, tài chính và điều phối ô kho cơ sở.
            </p>
          </div>
        </div>

        {/* Action Buttons: Đổi kho khẩn cấp (0đ) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDetail}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmergencyReassignOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-rose-800 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
            <span>Đổi kho khẩn cấp (0đ)</span>
          </button>
        </div>
      </div>

      {/* Grid thông tin chính */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Khách hàng */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Khách hàng
          </span>
          <div className="text-sm font-bold text-slate-900">{agreement.customerName || "—"}</div>
          <div className="text-xs text-slate-600 space-y-0.5">
            <div>SĐT: <span className="font-semibold">{agreement.customerPhone || "—"}</span></div>
            <div>Email: <span className="font-semibold">{agreement.customerEmail || "—"}</span></div>
          </div>
        </div>

        {/* Ô kho hiện tại */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ô kho đang sử dụng
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-extrabold text-[#1d5fe5]">
              Kho {agreement.unitCode || "—"}
            </span>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              {agreement.unitTypeName || "Tiêu chuẩn"}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Cơ sở: <strong className="text-slate-800">{agreement.facilityName || `Cơ sở #${agreement.facilityId || 1}`}</strong>
          </div>
        </div>

        {/* Thời hạn & Tài chính */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Thời hạn &amp; Tiền cọc
          </span>
          <div className="text-xs text-slate-700">
            Thời hạn: <strong className="text-slate-900">{formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}</strong>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Tiền cọc giữ chỗ:</span>
            <span className="font-bold text-emerald-700">{formatVnd(agreement.depositAmount || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Giá thuê / tháng:</span>
            <span className="font-bold text-slate-900">{formatVnd(agreement.monthlyRent || 0)}</span>
          </div>
        </div>
      </div>

      {/* Cam kết đổi kho 0đ banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 flex items-start gap-3">
        <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-blue-950">
          <span className="font-bold block text-blue-900">
            Chính sách đổi ô kho khẩn cấp (Emergency Unit Reassignment):
          </span>
          <span className="text-blue-800">
            Khi phát sinh sự cố kho hư hỏng nặng hoặc kẹt cửa, Quản lý được quyền đổi ngay sang ô kho tương đương cùng loại mà không thu thêm phí (0 VNĐ). Hợp đồng, thời hạn và tiền cọc được bảo lưu tuyệt đối.
          </span>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Lịch sử hóa đơn &amp; Thanh toán
        </h3>
        <div className="space-y-2">
          {(agreement.invoices ?? []).length === 0 ? (
            <p className="text-xs text-slate-400">Chưa có hóa đơn ghi nhận.</p>
          ) : (
            agreement.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{invoice.invoiceNo}</span>
                  <span className="text-slate-400 ml-2">Hạn: {formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    {formatVnd(invoice.paidAmount)} / {formatVnd(invoice.totalAmount)}
                  </span>
                  <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                    {formatStatusToEnglish(invoice.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Đổi kho khẩn cấp */}
      <EmergencyReassignModal
        isOpen={isEmergencyReassignOpen}
        agreement={agreement}
        facilityId={agreement.facilityId}
        oldUnitCode={agreement.unitCode}
        unitTypeId={agreement.unitTypeId}
        onClose={() => setIsEmergencyReassignOpen(false)}
        onSuccess={() => {
          loadDetail();
        }}
      />
    </div>
  );
}

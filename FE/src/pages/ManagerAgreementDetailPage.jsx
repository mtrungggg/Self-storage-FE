import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Boxes,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Scale,
  Flame,
  Lock,
  Warehouse,
} from "lucide-react";
import managerService from "../api/managerService";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

function formatDateOnly(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function calculateDuration(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months > 0) return `${months} tháng (~${diffDays} ngày)`;
  return `${diffDays} ngày`;
}

function getStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/20";
  if (s === "overdue" || s === "delinquent") return "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400/20";
  if (s === "terminated" || s === "cancelled") return "bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-400/20";
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/20";
  return "bg-slate-50 text-slate-600 border-slate-300 ring-1 ring-slate-400/20";
}

export default function ManagerAgreementDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-blue-600">
          progress_activity
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {t("common.loading", "Đang tải hồ sơ hợp đồng...")}
        </span>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/manager-agreements")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{t("common.back", "Quay lại danh sách hợp đồng")}</span>
        </button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error || "Không tìm thấy thông tin hợp đồng."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          nav, aside, header, footer, .screen-only {
            display: none !important;
          }
          .contract-document-wrapper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .page-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Screen Only) */}
      <div className="screen-only flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/manager-agreements"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title={t("common.back", "Quay lại danh sách")}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Chi tiết hợp đồng #{agreement.agreementNo || agreement.id}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${getStatusBadgeClass(
                  agreement.status
                )}`}
              >
                {formatStatusToEnglish(agreement.status)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian khởi tạo: {formatDateTime(agreement.createdAt)} · Giờ Việt Nam (UTC+7)
            </p>
          </div>
        </div>

        {/* Action Buttons: Refresh & Print (NO emergency reassignment button) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDetail}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>{t("common.refresh", "Làm mới")}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <Printer size={15} />
            <span>In hợp đồng / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Official Paper Contract Layout */}
      <div className="contract-document-wrapper rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-slate-900 space-y-8">
        {/* Formal Header: Nation Motto & Storage System Header */}
        <header className="border-b-2 border-slate-900 pb-6 page-break-inside-avoid">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2 font-black tracking-wider text-slate-900 text-sm">
                <Warehouse className="text-blue-600" size={20} />
                <span>G1 SELF STORAGE SYSTEM</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hệ thống dịch vụ lưu trữ thông minh &amp; quản lý tự động 24/7
              </p>
              <p className="text-[11px] text-slate-500">
                Hotline hỗ trợ: <strong className="text-slate-800">1900 8888</strong> • Email: <strong className="text-slate-800">support@g1storage.vn</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-[11px] font-semibold italic text-slate-600">
                Độc lập – Tự do – Hạnh phúc
              </p>
              <div className="mt-1 font-mono text-[11px] text-slate-500">
                Mã HĐ: <strong className="text-slate-900 font-bold">{agreement.agreementNo || agreement.id}</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
              HỢP ĐỒNG CHO THUÊ Ô KHO LƯU TRỮ CÁ NHÂN
            </h2>
            <p className="text-xs text-slate-500 mt-1 italic">
              (Số: <span className="font-mono font-bold text-slate-700">{agreement.agreementNo || agreement.id}</span> — Căn cứ Bộ luật Dân sự và Quy chế hoạt động của G1 Self Storage)
            </p>
          </div>
        </header>

        {/* 1. Mốc thời gian & Ngày giờ chi tiết (Milestones & Timestamps) */}
        <section className="page-break-inside-avoid">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Clock size={16} className="text-blue-600" />
            <span>Mốc thời gian &amp; Lịch trình hiệu lực hợp đồng</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Thời điểm khởi tạo
              </span>
              <div className="font-semibold text-slate-800">
                {formatDateTime(agreement.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Thời điểm ký kết
              </span>
              <div className="font-semibold text-slate-800">
                {formatDateTime(agreement.signedAt || agreement.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ngày bắt đầu thuê
              </span>
              <div className="font-bold text-blue-700">
                {formatDateOnly(agreement.startDate)}
              </div>
              <div className="text-[10px] text-slate-400">
                Check-in: {agreement.checkedInAt ? formatDateTime(agreement.checkedInAt) : "00:00"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ngày kết thúc thời hạn
              </span>
              <div className="font-bold text-slate-900">
                {formatDateOnly(agreement.endDate)}
              </div>
              <div className="text-[10px] text-slate-400">
                Thời hạn: {calculateDuration(agreement.startDate, agreement.endDate)}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Điều I: Thông tin các bên ký kết (Hai bên tham gia hợp đồng) */}
        <section className="page-break-inside-avoid space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-extrabold text-[11px]">
              01
            </span>
            <span>Điều 1: Thông tin các bên tham gia hợp đồng</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bên A: Đơn vị cho thuê */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <Building2 size={15} />
                  <span>Bên A: Bên cho thuê kho</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Đơn vị vận hành</span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Cơ sở lưu trữ:</span>
                  <strong className="text-slate-900">
                    {agreement.facilityName || (agreement.facilityId ? `Cơ sở #${agreement.facilityId}` : "Cơ sở Thu Duc Self Storage")}
                  </strong>
                  {agreement.facilityCode && <span className="ml-1.5 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{agreement.facilityCode}</span>}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Địa chỉ cơ sở:</span>
                  <span className="text-slate-800">
                    {[agreement.facilityAddress, agreement.facilityWard, agreement.facilityDistrict, agreement.facilityCity].filter(Boolean).join(", ") || "Số 123 Đường Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Khung giờ hoạt động:</span>
                  <span className="text-slate-800">
                    {agreement.facilityOpeningTime ? `${agreement.facilityOpeningTime} - ${agreement.facilityClosingTime}` : "06:00 - 22:00 (Ra vào bằng mã số / thẻ từ 24/7)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Đại diện cơ sở:</span>
                  <span className="font-semibold text-slate-800">Quản lý vận hành cơ sở (Facility Manager)</span>
                </div>
              </div>
            </div>

            {/* Bên B: Khách hàng thuê */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <User size={15} />
                  <span>Bên B: Khách hàng thuê kho</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Chủ thể thuê</span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Họ và tên khách hàng:</span>
                  <strong className="text-slate-900 text-sm">{agreement.customerName || "—"}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                    <strong className="text-slate-800">{agreement.customerPhone || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số CCCD / CMND:</span>
                    <strong className="text-slate-800">{agreement.customerIdentityNumber || "Đã xác thực trên hệ thống"}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email liên hệ:</span>
                  <span className="font-medium text-slate-800">{agreement.customerEmail || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Địa chỉ thường trú / Liên lạc:</span>
                  <span className="text-slate-800">{agreement.customerAddress || "Địa chỉ đã cập nhật trong hồ sơ cá nhân"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Liên hệ khẩn cấp:</span>
                  <span className="text-slate-700">
                    {agreement.emergencyContactName ? `${agreement.emergencyContactName} (SĐT: ${agreement.emergencyContactPhone || "—"})` : "Chưa đăng ký"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Điều II: Quy cách Ô kho thuê & Thông số kỹ thuật */}
        <section className="page-break-inside-avoid space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-extrabold text-[11px]">
              02
            </span>
            <span>Điều 2: Quy cách ô kho thuê &amp; Vị trí mặt bằng</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Mã định danh ô kho
              </span>
              <div className="font-mono text-base font-black text-slate-900 mt-0.5">
                {agreement.unitCode ? `Kho ${agreement.unitCode}` : "Chưa chỉ định ô kho"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Phân loại quy chuẩn
              </span>
              <div className="font-bold text-slate-800 mt-0.5">
                {agreement.unitTypeName || "Kho Tiêu chuẩn (Standard)"}
              </div>
              <div className="text-[10px] text-slate-500">
                {agreement.climateControlled ? "Có điều hòa & hút ẩm 24/7" : "Kho thoáng khí tự nhiên"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Vị trí &amp; Phân khu
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {agreement.floorLabel ? `Tầng ${agreement.floorLabel}` : "Tầng 1"} · {agreement.zoneLabel ? `Phân khu ${agreement.zoneLabel}` : "Khu vực kho A"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Diện tích &amp; Thể tích
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {agreement.unitAreaM2 ? `${agreement.unitAreaM2} m²` : "—"} · {agreement.unitVolumeM3 ? `${agreement.unitVolumeM3} m³` : "—"}
              </div>
              <div className="text-[10px] text-slate-400">
                {agreement.unitLengthM && agreement.unitWidthM ? `${agreement.unitLengthM}m × ${agreement.unitWidthM}m × ${agreement.unitHeightM || 2.5}m` : "Kích thước tiêu chuẩn"}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Điều III: Điều khoản tài chính, Tiền cọc & Lịch sử hóa đơn */}
        <section className="page-break-inside-avoid space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-extrabold text-[11px]">
              03
            </span>
            <span>Điều 3: Giá thuê, Tiền cọc bảo đảm &amp; Nghĩa vụ thanh toán</span>
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Giá thuê định kỳ / tháng
              </span>
              <div className="text-base font-extrabold text-slate-900">
                {formatVnd(agreement.monthlyRent || 0)}
              </div>
              <div className="text-[10px] text-slate-500">Chu kỳ thanh toán hàng tháng</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tiền đặt cọc bảo đảm
              </span>
              <div className="text-base font-extrabold text-emerald-700">
                {formatVnd(agreement.depositAmount || 0)}
              </div>
              <div className="text-[10px] text-slate-500">Bảo lưu hoàn trả sau thanh lý hợp đồng</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tổng công nợ còn lại
              </span>
              <div className={`text-base font-extrabold ${agreement.totalDebt > 0 ? "text-rose-600" : "text-slate-800"}`}>
                {formatVnd(agreement.totalDebt || 0)}
              </div>
              <div className="text-[10px] text-slate-500">
                {agreement.totalDebt > 0 ? "Có hóa đơn quá hạn cần thanh toán" : "Đã thanh toán đầy đủ các kỳ"}
              </div>
            </div>
          </div>

          {/* Lịch sử hóa đơn */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Receipt size={14} />
                <span>Danh sách hóa đơn phát sinh</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {(agreement.invoices ?? []).length} hóa đơn ghi nhận
              </span>
            </div>

            {(agreement.invoices ?? []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có hóa đơn nào được phát hành cho hợp đồng này.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2">Mã hóa đơn</th>
                      <th className="px-3 py-2">Ngày phát hành</th>
                      <th className="px-3 py-2">Hạn nộp tiền</th>
                      <th className="px-3 py-2 text-right">Đã thanh toán</th>
                      <th className="px-3 py-2 text-right">Tổng số tiền</th>
                      <th className="px-3 py-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agreement.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                        <td className="px-3 py-2.5 text-slate-500">{formatDateOnly(inv.issueDate)}</td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium">{formatDateOnly(inv.dueDate)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-emerald-700">{formatVnd(inv.paidAmount)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatVnd(inv.totalAmount)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            String(inv.status).toLowerCase() === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            String(inv.status).toLowerCase() === "overdue" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {formatStatusToEnglish(inv.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* 5. Điều IV: Danh mục hàng hóa ký gửi & Tài sản lưu kho */}
        <section className="page-break-inside-avoid space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-extrabold text-[11px]">
              04
            </span>
            <span>Điều 4: Danh mục tài sản &amp; Hàng hóa khai báo lưu kho</span>
          </h3>

          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Boxes size={14} />
                <span>Chi tiết tài sản đăng ký lưu kho</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {(agreement.storedItems ?? []).length} mục hàng hóa
              </span>
            </div>

            {(agreement.storedItems ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                Khách hàng chưa khai báo danh mục đồ vật chi tiết trên hệ thống. Trách nhiệm tự bảo quản và quản lý tài sản thuộc về Bên B theo Nội quy cơ sở kho.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Tên đồ vật / Kiện hàng</th>
                      <th className="px-3 py-2">Số lượng</th>
                      <th className="px-3 py-2">Phân loại</th>
                      <th className="px-3 py-2">Cấp độ rủi ro</th>
                      <th className="px-3 py-2 text-right">Giá trị ước tính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agreement.storedItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{item.itemName}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">×{item.quantity}</td>
                        <td className="px-3 py-2 text-slate-600">{item.category || "Chung"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            String(item.riskClassification || "").toLowerCase() === "high" ? "bg-rose-100 text-rose-800" :
                            String(item.riskClassification || "").toLowerCase() === "medium" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {item.riskClassification || "None"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-800">
                          {item.estimatedValue ? formatVnd(item.estimatedValue) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* 6. Điều V: Nội quy cơ sở kho & Quy định an toàn PCCC (CRITICAL REQUIREMENTS) */}
        <section className="page-break-inside-avoid space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 font-extrabold text-[11px]">
              05
            </span>
            <span>Điều 5: Nội quy cơ sở kho &amp; An toàn phòng cháy chữa cháy (PCCC)</span>
          </h3>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
              <Flame size={16} className="text-rose-600" />
              <span>5.1. Danh mục hàng hóa và chất TUYỆT ĐỐI CẤM lưu trữ trong ô kho:</span>
            </div>

            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
              <li>
                <strong className="text-rose-800">Chất dễ cháy nổ:</strong> Xăng, dầu, bình gas, cồn công nghiệp, hóa chất ăn mòn, chất oxy hóa mạnh, pháo nổ, diêm quẹt và các chất dễ tự bốc cháy.
              </li>
              <li>
                <strong className="text-rose-800">Vũ khí &amp; Vật liệu cấm:</strong> Súng đạn, vũ khí quân dụng, công cụ hỗ trợ chưa được cấp phép của cơ quan công an.
              </li>
              <li>
                <strong className="text-rose-800">Hàng sinh vật &amp; Thực phẩm tươi sống:</strong> Động vật sống, côn trùng, thực phẩm tươi sống dễ ôi thiu phát sinh vi khuẩn, nấm mốc hoặc mùi nồng nặc gây ảnh hưởng kho xung quanh.
              </li>
              <li>
                <strong className="text-rose-800">Hàng hóa bất hợp pháp:</strong> Hàng lậu, hàng giả, hàng quốc cấm, ma túy, chất kích thích hoặc tài sản có nguồn gốc phạm pháp.
              </li>
              <li>
                <strong className="text-rose-800">Tài sản đặc thù:</strong> Tiền mặt số lượng lớn, vàng bạc kim khí quý không khai báo bảo hiểm chuyên dụng riêng biệt.
              </li>
            </ul>

            <div className="border-t border-rose-200/70 pt-2.5 flex items-center gap-2 font-bold text-slate-900 text-xs">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>5.2. Quy tắc an ninh, bảo mật &amp; PCCC tại cơ sở:</span>
            </div>

            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
              <li>Nghiêm cấm tuyệt đối việc hút thuốc lá, sử dụng nguồn nhiệt, ngọn lửa trần hoặc đấu nối nguồn điện tùy tiện trong khuôn viên ô kho.</li>
              <li>Bên B có nghĩa vụ tự bảo quản mã khóa PIN, thẻ từ và chìa khóa ô kho riêng. Mọi hành vi cấp quyền cho bên thứ ba phải được khai báo với ban quản lý cơ sở.</li>
              <li>Luôn giữ lối đi chung thông thoáng, không để vật cản trước cửa ô kho hoặc các lối thoát hiểm của tòa nhà.</li>
              <li>Nghiêm cấm dùng ô kho làm nơi cư trú, nơi lưu trú qua đêm, phòng làm việc cố định hoặc các hoạt động chế biến sản xuất.</li>
            </ul>
          </div>
        </section>

        {/* 7. Điều VI, VII, VIII: Quyền & Nghĩa vụ, Xử lý vi phạm */}
        <section className="page-break-inside-avoid space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-1.5">
              <Scale size={15} className="text-blue-600" />
              <span>Điều 6: Quyền và nghĩa vụ của các bên</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1.5">
                <span className="font-bold text-blue-800 text-[11px] block">6.1. Về phía Bên A (G1 Self Storage):</span>
                <p className="text-[11px] text-slate-600">
                  - Bảo đảm cơ sở vật chất, hệ thống chiếu sáng, camera an ninh 24/7 và hệ thống PCCC hoạt động ổn định.<br />
                  - Tạo điều kiện thuận lợi cho Bên B ra vào ô kho trong khung giờ hoạt động niêm yết.<br />
                  - Được quyền mở cửa kiểm tra ô kho trong các tình huống khẩn cấp (khói, báo cháy, nghi vấn vi phạm pháp luật hoặc theo lệnh của cơ quan chức năng).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1.5">
                <span className="font-bold text-emerald-800 text-[11px] block">6.2. Về phía Bên B (Khách hàng thuê):</span>
                <p className="text-[11px] text-slate-600">
                  - Sử dụng ô kho đúng mục đích và tuân thủ nghiêm chỉnh Nội quy cơ sở kho.<br />
                  - Thanh toán tiền thuê đúng hạn định ghi trên hóa đơn phát hành hàng tháng.<br />
                  - Chịu trách nhiệm bảo quản tài sản bên trong và bồi thường thiệt hại nếu gây hư hỏng thiết bị, tường vách kho của Bên A.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Điều 7: Chế tài quá hạn thanh toán &amp; Quy chế thanh lý tài sản</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              - Trường hợp chậm nộp tiền thuê sau <strong>01 ngày</strong> kể từ ngày đến hạn: Hệ thống sẽ tự động tạm dừng quyền truy cập mở cửa ô kho cho đến khi hóa đơn được thanh toán đầy đủ.<br />
              - Trường hợp quá hạn quá <strong>30 ngày</strong>: Bên A có quyền đơn phương chấm dứt hợp đồng, khấu trừ toàn bộ tiền cọc để bù trừ công nợ và tiến hành niêm phong ô kho.<br />
              - Sau thời gian thông báo tối thiểu 15 ngày bằng văn bản/email/điện thoại mà Bên B không thanh lý công nợ và không đến nhận lại đồ đạc, Bên A có quyền thực hiện quy trình xử lý và thanh lý tài sản tồn đọng theo Quy định vận hành của hệ thống và luật pháp hiện hành.
            </p>
          </div>
        </section>

        {/* 8. Xác nhận ký kết điện tử hai bên (Digital Signatures) */}
        <section className="page-break-inside-avoid border-t-2 border-slate-900 pt-6">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            {/* Bên A */}
            <div className="space-y-12">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  (Ký, đóng dấu điện tử và xác nhận qua hệ thống)
                </p>
              </div>

              <div className="inline-block rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-blue-900">
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-blue-800">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  <span>ĐÃ KÝ ĐIỆN TỬ BỞI HỆ THỐNG G1</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Thời điểm: {formatDateTime(agreement.createdAt)}
                </div>
              </div>

              <p className="font-bold text-slate-800">
                BAN QUẢN LÝ CƠ SỞ KHO G1
              </p>
            </div>

            {/* Bên B */}
            <div className="space-y-12">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  ĐẠI DIỆN BÊN THUÊ KHO (BÊN B)
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  (Khách hàng ký nhận hoặc xác thực điện tử)
                </p>
              </div>

              <div className="inline-block rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 text-emerald-900">
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>XÁC THỰC KÝ ĐIỆN TỬ QUA TÀI KHOẢN</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Thời điểm: {formatDateTime(agreement.signedAt || agreement.createdAt)}
                </div>
              </div>

              <p className="font-bold text-slate-800">
                {agreement.customerName || "KHÁCH HÀNG"}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 italic">
            Hợp đồng này được lưu trữ điện tử trên hệ thống quản lý G1 Self Storage và có giá trị pháp lý tương đương bản in giấy theo Luật Giao dịch điện tử.
          </div>
        </section>
      </div>
    </div>
  );
}

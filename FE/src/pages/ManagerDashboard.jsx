import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  Coins,
  TrendingUp,
  Boxes,
  FileCheck2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Percent,
} from "lucide-react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatVnd } from "../lib/utils";

export default function ManagerDashboard() {
  const { facilityId, activeFacility, loading: facilityLoading } = useManagerFacility();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await managerService.getDashboard(facilityId);
      setData(res);
    } catch (err) {
      setError(err?.message || "Không thể tải bảng điều khiển thống kê cơ sở.");
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Normalize stats from flat or nested responses
  const stats = {
    totalUnits: data?.totalUnits ?? data?.occupancy?.totalUnits ?? 0,
    occupiedUnits: data?.occupiedUnits ?? data?.occupancy?.occupiedUnits ?? 0,
    availableUnits: data?.availableUnits ?? data?.occupancy?.availableUnits ?? 0,
    reservedUnits: data?.reservedUnits ?? data?.occupancy?.reservedUnits ?? 0,
    maintenanceUnits: data?.maintenanceUnits ?? data?.occupancy?.maintenanceUnits ?? 0,
    occupancyRate: data?.occupancyRate ?? data?.occupancy?.occupancyRate ?? (
      data?.totalUnits ? Math.round(((data?.occupiedUnits || 0) / data.totalUnits) * 100) : 0
    ),
    totalRevenue: data?.totalRevenue ?? data?.revenue?.totalRevenue ?? 0,
    monthlyRevenue: data?.monthlyRevenue ?? data?.thisMonthRevenue ?? data?.revenue?.monthlyRevenue ?? 0,
    outstandingBalance: data?.outstandingBalance ?? data?.revenue?.outstandingBalance ?? 0,
    activeAgreements: data?.activeAgreements ?? data?.agreementsCount ?? 0,
    pendingTasks: data?.pendingTasks ?? data?.tasksCount ?? 0,
    pendingRefunds: data?.pendingRefunds ?? data?.refundsCount ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1d5fe5]">
            <Warehouse className="h-4 w-4" />
            <span>Facility Management</span>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-[#0b1c30]">
            <LayoutDashboard className="h-7 w-7 text-[#1d5fe5]" />
            Bảng điều khiển cơ sở kho
          </h1>
          <p className="mt-1 text-sm text-[#58657a]">
            {activeFacility
              ? `Thống kê tỷ lệ lấp đầy, doanh thu & vận hành kho: ${activeFacility.name} (${activeFacility.code || activeFacility.id})`
              : "Thống kê thời gian thực theo cơ sở được chọn"}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading || facilityLoading || !facilityId}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#154ec2] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <button type="button" onClick={loadDashboard} className="mt-1 font-bold underline hover:no-underline">
              Thử tải lại
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dfe7f5] bg-white py-16 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-[#1d5fe5]" />
          <p className="mt-3 text-sm font-semibold text-[#58657a]">Đang tải dữ liệu dashboard cơ sở...</p>
        </div>
      )}

      {/* Main Content */}
      {(!loading || data) && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Occupancy Rate */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Tỷ lệ lấp đầy</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1d5fe5]">
                  <Percent className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#0b1c30]">
                {Number(stats.occupancyRate || 0).toFixed(1)}%
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#58657a]">
                <span className="font-semibold text-emerald-600">{stats.occupiedUnits}</span> / {stats.totalUnits} ô đã thuê
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#1d5fe5] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, stats.occupancyRate))}%` }}
                />
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Doanh thu tháng này</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#0b1c30]">
                {formatVnd(stats.monthlyRevenue)}
              </div>
              <div className="mt-2 text-xs text-[#58657a]">
                Tổng thu: <span className="font-semibold text-slate-800">{formatVnd(stats.totalRevenue)}</span>
              </div>
            </div>

            {/* Active Agreements */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Hợp đồng hiệu lực</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FileCheck2 className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#0b1c30]">
                {stats.activeAgreements}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#58657a]">
                <span>Đang hoạt động tại kho</span>
                <Link to="/manager-agreements" className="font-bold text-[#1d5fe5] hover:underline">
                  Xem &rarr;
                </Link>
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Công nợ quá hạn</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Coins className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-rose-600">
                {formatVnd(stats.outstandingBalance)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#58657a]">
                <span>Cần xử lý nhắc nợ</span>
                <Link to="/manager-delinquent-cases" className="font-bold text-rose-600 hover:underline">
                  Xử lý &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Unit Inventory Status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
                  <Boxes className="h-5 w-5 text-[#1d5fe5]" />
                  Tình trạng ô kho cơ sở
                </h2>
                <Link to="/manager-units" className="text-xs font-bold text-[#1d5fe5] hover:underline">
                  Quản lý ô kho &amp; sơ đồ &rarr;
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-[#58657a]">Tổng ô kho</div>
                  <div className="mt-1 text-2xl font-black text-[#0b1c30]">{stats.totalUnits}</div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="text-xs font-semibold text-blue-700">Đang thuê</div>
                  <div className="mt-1 text-2xl font-black text-blue-900">{stats.occupiedUnits}</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-semibold text-emerald-700">Còn trống</div>
                  <div className="mt-1 text-2xl font-black text-emerald-900">{stats.availableUnits}</div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-xs font-semibold text-amber-700">Đặt trước / Bảo trì</div>
                  <div className="mt-1 text-2xl font-black text-amber-900">
                    {stats.reservedUnits + stats.maintenanceUnits}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#58657a]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                      Đang sử dụng: {stats.occupiedUnits}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      Trống: {stats.availableUnits}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-amber-500" />
                      Khác: {stats.reservedUnits + stats.maintenanceUnits}
                    </span>
                  </div>
                  <Link
                    to="/manager-units"
                    className="inline-flex items-center gap-1 font-bold text-[#1d5fe5] hover:underline"
                  >
                    Xem sơ đồ mặt bằng
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Navigation / Action Hub */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
                  <TrendingUp className="h-5 w-5 text-[#1d5fe5]" />
                  Truy cập nhanh chức năng
                </h2>
                <div className="mt-4 space-y-2">
                  <Link
                    to="/manager-shifts"
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-[#1d5fe5]" />
                      Lịch trực &amp; phân ca nhân viên
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    to="/manager-transfer-requests"
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Boxes className="h-4 w-4 text-[#1d5fe5]" />
                      Yêu cầu chuyển kho liên cơ sở
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    to="/manager-charge-proposals"
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Coins className="h-4 w-4 text-amber-600" />
                      Duyệt phụ phí hư hại
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    to="/manager-refund-approvals"
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Coins className="h-4 w-4 text-emerald-600" />
                      Duyệt hoàn tiền cọc
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    to="/manager-pricing"
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm font-semibold text-[#0b1c30] transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-blue-600" />
                      Biểu giá thuê &amp; khuyến mãi cơ sở
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

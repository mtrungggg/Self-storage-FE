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
  CalendarCheck,
  LogIn,
  LogOut,
  ClipboardCheck,
  LifeBuoy,
  AlertTriangle,
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

  // Extract properties matching backend ManagerFacilityDashboardDto exactly
  const stats = {
    totalUnits: data?.totalUnits ?? 0,
    occupiedUnits: data?.occupiedUnits ?? 0,
    availableUnits: data?.availableUnits ?? 0,
    reservedUnits: data?.reservedUnits ?? 0,
    maintenanceUnits: data?.maintenanceUnits ?? 0,
    occupancyRate: data?.occupancyRate ?? (
      data?.totalUnits ? Math.round(((data?.occupiedUnits || 0) / data.totalUnits) * 100) : 0
    ),
    thisMonthRevenue: data?.thisMonthRevenue ?? 0,
    totalOutstandingDebt: data?.totalOutstandingDebt ?? 0,
    openTicketsCount: data?.openTicketsCount ?? 0,
    urgentTicketsCount: data?.urgentTicketsCount ?? 0,
    dailySchedule: {
      todayCheckInsCount: data?.dailySchedule?.todayCheckInsCount ?? 0,
      todayCheckOutsCount: data?.dailySchedule?.todayCheckOutsCount ?? 0,
      todayInspectionsCount: data?.dailySchedule?.todayInspectionsCount ?? 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1d5fe5]">
            <Warehouse className="h-4 w-4" />
            <span>Facility Management Console</span>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight text-[#0b1c30]">
            <LayoutDashboard className="h-7 w-7 text-[#1d5fe5]" />
            Bảng điều khiển cơ sở kho
          </h1>
          <p className="mt-1 text-sm text-[#58657a]">
            {activeFacility
              ? `Thống kê tỷ lệ lấp đầy, doanh thu & lịch vận hành: ${activeFacility.name} (${activeFacility.code || `Hub #${activeFacility.id}`})`
              : "Thống kê thời gian thực theo cơ sở kho được chọn"}
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
          {/* Top 4 Key KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Occupancy Rate */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Tỷ lệ lấp đầy</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1d5fe5]">
                  <Percent className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#0b1c30]">
                {Number(stats.occupancyRate || 0).toFixed(1)}%
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#58657a]">
                <span>
                  Đã thuê: <strong className="text-blue-600">{stats.occupiedUnits}</strong> / {stats.totalUnits} ô
                </span>
                <span className="font-semibold text-emerald-600">Trống {stats.availableUnits}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#1d5fe5] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, stats.occupancyRate))}%` }}
                />
              </div>
            </div>

            {/* This Month Revenue */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Doanh thu tháng này</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-[#0b1c30]">
                {formatVnd(stats.thisMonthRevenue)}
              </div>
              <div className="mt-2 text-xs text-[#58657a]">
                Cơ sở: <span className="font-semibold text-slate-800">{activeFacility?.name || "Cơ sở kho"}</span>
              </div>
            </div>

            {/* Outstanding Debt */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Công nợ quá hạn</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Coins className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-rose-600">
                {formatVnd(stats.totalOutstandingDebt)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#58657a]">
                <span>Cần nhắc nợ</span>
                <Link to="/manager-delinquent-cases" className="font-bold text-rose-600 hover:underline">
                  Xử lý nợ &rarr;
                </Link>
              </div>
            </div>

            {/* Open / Urgent Tickets */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">Ticket &amp; Hỗ trợ</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <LifeBuoy className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0b1c30]">{stats.openTicketsCount}</span>
                {stats.urgentTicketsCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 border border-rose-200">
                    <AlertTriangle className="h-3 w-3" />
                    {stats.urgentTicketsCount} khẩn cấp
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#58657a]">
                <span>Cần xử lý tại kho</span>
                <Link to="/manager-tickets" className="font-bold text-[#1d5fe5] hover:underline">
                  Xem tickets &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Today's Daily Schedule & Inventory Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Today's Operational Schedule */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
                  <CalendarCheck className="h-5 w-5 text-[#1d5fe5]" />
                  Lịch vận hành hôm nay
                </h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                  Real-time
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8faff] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0b1c30]">Check-in dự kiến</div>
                      <div className="text-xs text-[#58657a]">Khách nhận ô kho mới</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0b1c30]">
                    {stats.dailySchedule.todayCheckInsCount}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8faff] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0b1c30]">Check-out / Trả kho</div>
                      <div className="text-xs text-[#58657a]">Hết hạn hoặc chấm dứt hợp đồng</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0b1c30]">
                    {stats.dailySchedule.todayCheckOutsCount}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8faff] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0b1c30]">Nghiệm thu ô kho</div>
                      <div className="text-xs text-[#58657a]">Khảo sát &amp; biên bản hư hại</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0b1c30]">
                    {stats.dailySchedule.todayInspectionsCount}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <Link
                  to="/manager-move-outs"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1d5fe5] hover:underline"
                >
                  Xem lịch hẹn di dời &amp; nghiệm thu chi tiết
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#0b1c30]">
                  <Boxes className="h-5 w-5 text-[#1d5fe5]" />
                  Chi tiết tình trạng ô kho
                </h2>
                <Link to="/manager-units" className="text-xs font-bold text-[#1d5fe5] hover:underline">
                  Quản lý ô kho &amp; bản đồ sơ đồ &rarr;
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-xs font-semibold text-[#58657a]">Tổng số ô</div>
                  <div className="mt-1 text-2xl font-black text-[#0b1c30]">{stats.totalUnits}</div>
                  <div className="mt-1 text-[10px] text-slate-500">Toàn cơ sở</div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                  <div className="text-xs font-semibold text-blue-700">Đang thuê</div>
                  <div className="mt-1 text-2xl font-black text-blue-900">{stats.occupiedUnits}</div>
                  <div className="mt-1 text-[10px] text-blue-600">Đang hoạt động</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <div className="text-xs font-semibold text-emerald-700">Còn trống</div>
                  <div className="mt-1 text-2xl font-black text-emerald-900">{stats.availableUnits}</div>
                  <div className="mt-1 text-[10px] text-emerald-600">Sẵn sàng thuê</div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <div className="text-xs font-semibold text-amber-700">Đã đặt trước</div>
                  <div className="mt-1 text-2xl font-black text-amber-900">{stats.reservedUnits}</div>
                  <div className="mt-1 text-[10px] text-amber-600">Chờ nhận kho</div>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                  <div className="text-xs font-semibold text-rose-700">Bảo trì / Khóa</div>
                  <div className="mt-1 text-2xl font-black text-rose-900">{stats.maintenanceUnits}</div>
                  <div className="mt-1 text-[10px] text-rose-600">Cần sửa chữa</div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#58657a] mb-3">
                  Lối tắt nghiệp vụ quản lý
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Link
                    to="/manager-units"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-100 p-3 text-center transition hover:border-[#1d5fe5] hover:bg-blue-50/50"
                  >
                    <Boxes className="h-5 w-5 text-[#1d5fe5] mb-1.5" />
                    <span className="text-xs font-bold text-[#0b1c30]">Sơ đồ kho</span>
                  </Link>

                  <Link
                    to="/manager-shifts"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-100 p-3 text-center transition hover:border-[#1d5fe5] hover:bg-blue-50/50"
                  >
                    <Users className="h-5 w-5 text-indigo-600 mb-1.5" />
                    <span className="text-xs font-bold text-[#0b1c30]">Phân ca trực</span>
                  </Link>

                  <Link
                    to="/manager-charge-proposals"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-100 p-3 text-center transition hover:border-[#1d5fe5] hover:bg-blue-50/50"
                  >
                    <Coins className="h-5 w-5 text-amber-600 mb-1.5" />
                    <span className="text-xs font-bold text-[#0b1c30]">Duyệt phụ phí</span>
                  </Link>

                  <Link
                    to="/manager-pricing"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-100 p-3 text-center transition hover:border-[#1d5fe5] hover:bg-blue-50/50"
                  >
                    <ShieldAlert className="h-5 w-5 text-emerald-600 mb-1.5" />
                    <span className="text-xs font-bold text-[#0b1c30]">Biểu giá thuê</span>
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

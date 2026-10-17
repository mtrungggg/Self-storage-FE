import { useCallback, useEffect, useState } from "react";
import adminDashboardService from "../api/adminDashboardService";

const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const format = (value, type) => value == null ? "—" : type === "money" ? money.format(value) : number.format(value) + (type === "rate" ? "%" : "");
const sections = [
  ["Doanh thu và hóa đơn", "revenueKpi", [
    ["Tổng doanh thu", "totalRevenue", "money"],
    ["Doanh thu tháng này", "thisMonthRevenue", "money"],
    ["Doanh thu tháng trước", "lastMonthRevenue", "money"],
    ["Tổng hóa đơn", "totalInvoices"],
    ["Hóa đơn đã thanh toán", "paidInvoices"],
    ["Hóa đơn quá hạn", "overdueInvoices"],
    ["Hóa đơn đang mở", "openInvoices"],
  ]],
  ["Tình trạng kho", "occupancyKpi", [
    ["Tổng cơ sở", "totalFacilities"],
    ["Tổng ô kho", "totalStorageUnits"],
    ["Ô kho đang sử dụng", "occupiedUnits"],
    ["Ô kho đã đặt trước", "reservedUnits"],
    ["Ô kho còn trống", "availableUnits"],
    ["Ô kho bảo trì", "maintenanceUnits"],
    ["Tỷ lệ lấp đầy hệ thống", "systemOccupancyRate", "rate"],
  ]],
  ["Người dùng và hợp đồng", "userKpi", [
    ["Tổng người dùng", "totalUsers"],
    ["Tổng khách hàng", "totalCustomers"],
    ["Tổng nhân viên", "totalStaff"],
    ["Hợp đồng thuê đang hoạt động", "activeRentals"],
  ]],
];
const columns = [
  ["Mã cơ sở", "facilityCode"], ["Tên cơ sở", "facilityName"],
  ["Thành phố", "city"], ["Trạng thái", "status"],
  ["Tổng ô kho", "totalUnits", "number"], ["Đang sử dụng", "occupiedUnits", "number"],
  ["Đã đặt trước", "reservedUnits", "number"], ["Còn trống", "availableUnits", "number"],
  ["Tỷ lệ lấp đầy", "occupancyRate", "rate"],
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;
    adminDashboardService.getOverview()
      .then((data) => { if (active) setOverview(data); })
      .catch((err) => { if (active) setError(err.message || "Không thể tải dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    window.addEventListener("admin-data-changed", reload);
    return () => window.removeEventListener("admin-data-changed", reload);
  }, [reload]);

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1d5fe5]">Admin Console</p>
        <h1 className="mt-1 text-2xl font-bold">Dashboard quản trị</h1>
        <p className="mt-1 text-sm text-[#58657a]">Theo dõi và quản lý hoạt động hệ thống G1 SelfStorage.</p>
      </div>
      <button type="button" disabled={loading} onClick={reload} className="rounded-xl bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {error ? "Thử lại" : "Làm mới"}
      </button>
    </div>
    {loading && <p role="status" className="mt-6 text-sm text-[#58657a]">Đang tải dashboard...</p>}
    {!loading && error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && overview && <>
      {sections.map(([title, group, fields]) => <section key={group} className="mt-6">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {fields.map(([label, key, type]) => <div key={key} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#58657a]">{label}</p>
            <strong className="mt-3 block break-words text-2xl">{format(overview[group][key], type)}</strong>
          </div>)}
        </div>
      </section>)}
      <section className="mt-6 rounded-2xl border border-[#dfe7f5] bg-white p-5">
        <h2 className="text-lg font-bold">Tổng quan từng cơ sở</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-[#f8faff] text-[#58657a]"><tr>
              {columns.map(([label, key]) => <th key={key} scope="col" className="px-3 py-3">{label}</th>)}
            </tr></thead>
            <tbody>{overview.facilityBreakdown.map((facility) => <tr key={facility.facilityId} className="border-t border-[#dfe7f5]">
              {columns.map(([, key, type]) => <td key={key} className="px-3 py-3">{type ? format(facility[key], type) : facility[key] || "—"}</td>)}
            </tr>)}</tbody>
          </table>
          {!overview.facilityBreakdown.length && <p className="py-6 text-center text-sm text-[#58657a]">Chưa có cơ sở nào.</p>}
        </div>
      </section>
    </>}
  </div>;
}

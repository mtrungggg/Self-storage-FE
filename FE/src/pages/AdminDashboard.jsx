import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Users,
  RefreshCw,
  Boxes,
  Search,
  Download,
  Upload,
  TriangleAlert,
  ChartNoAxesCombined,
} from "lucide-react";
import adminDashboardService from "../api/adminDashboardService";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const format = (value, type) =>
  value == null ? "—" : type === "money" ? money.format(value) : number.format(value) + (type === "rate" ? "%" : "");
const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const statuses = { active: "Active", inactive: "Inactive", maintenance: "Maintenance" };

function exportFacilities(facilities) {
  const cell = (value) => `"${String(value ?? "").replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const rows = [
    ["Facility Code", "Facility Name", "City", "Status", "Total Units", "Occupied", "Reserved", "Available", "Occupancy Rate (%)"],
    ...facilities.map((item) => [
      item.facilityCode,
      item.facilityName,
      item.city,
      statuses[String(item.status).toLowerCase()] || item.status,
      item.totalUnits,
      item.occupiedUnits,
      item.reservedUnits,
      item.availableUnits,
      item.occupancyRate,
    ]),
  ];
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", rows.map((row) => row.map(cell).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "facility-operations-report.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SummaryCard({ label, value, detail, icon: Icon, to, linkLabel, badge }) {
  return (
    <article className="reference-card reference-summary">
      <p className="reference-card-label">{label}</p>
      <div className="reference-summary-value">
        <strong>{format(value)}</strong>
        {badge && <span className="reference-lime">{badge}</span>}
      </div>
      <span className="reference-summary-icon">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <p className="reference-muted">{detail}</p>
      <Link className="reference-card-link" to={to}>
        <span>{linkLabel}</span>
        <ArrowRight size={15} strokeWidth={2} />
      </Link>
    </article>
  );
}

function OccupancyChart({ occupancy }) {
  const segments = [
    ["Occupied", occupancy.occupiedUnits, "#2563eb"],     // Royal Blue
    ["Available", occupancy.availableUnits, "#94a3b8"],    // Slate Gray
    ["Reserved", occupancy.reservedUnits, "#f59e0b"],     // Amber
    ["Maintenance", occupancy.maintenanceUnits, "#f43f5e"], // Rose
  ];
  const total = segments.reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0);
  let offset = 0;
  return (
    <section className="reference-card reference-occupancy">
      <div className="reference-card-heading">
        <h2>Unit Distribution</h2>
        <span className="reference-pill">Network-wide</span>
      </div>
      <div className="reference-ring-wrap">
        <svg
          className="reference-ring"
          viewBox="0 0 240 240"
          role="img"
          aria-label={`Unit distribution. Occupancy rate: ${format(occupancy.systemOccupancyRate, "rate")}`}
        >
          <circle cx="120" cy="120" r="91" fill="none" stroke="#f1f5f9" strokeWidth="26" />
          {segments.map(([label, value, color]) => {
            const share = total ? (Math.max(0, Number(value) || 0) / total) * 100 : 0;
            const start = offset;
            offset += share;
            return (
              share > 0 && (
                <circle
                  key={label}
                  cx="120"
                  cy="120"
                  r="91"
                  fill="none"
                  stroke={color}
                  strokeWidth="26"
                  pathLength="100"
                  strokeDasharray={`${Math.max(0, share - 0.8)} ${100 - Math.max(0, share - 0.8)}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 120 120)"
                />
              )
            );
          })}
        </svg>
        <div className="reference-ring-center">
          <strong>{format(occupancy.totalStorageUnits)}</strong>
          <span className="reference-lime">{format(occupancy.systemOccupancyRate, "rate")} occupied</span>
        </div>
      </div>
      <div className="reference-ring-legend">
        {segments.map(([label, value, color]) => (
          <div key={label}>
            <span style={{ background: color }} />
            <span>{label}</span>
            <strong>{format(value)}</strong>
          </div>
        ))}
      </div>
      <div className="reference-ring-total">
        <span>Total Facilities</span>
        <strong>{format(occupancy.totalFacilities)}</strong>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;
    adminDashboardService
      .getOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load dashboard metrics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    window.addEventListener("admin-data-changed", reload);
    return () => window.removeEventListener("admin-data-changed", reload);
  }, [reload]);

  const revenue = overview?.revenueKpi || {};
  const occupancy = overview?.occupancyKpi || {};
  const users = overview?.userKpi || {};
  const facilities = (overview?.facilityBreakdown || []).filter((item) =>
    [item.facilityName, item.facilityCode, item.city].some((value) =>
      String(value || "").toLowerCase().includes(query.trim().toLowerCase())
    )
  );

  const revenueMax = Math.max(revenue.lastMonthRevenue || 0, revenue.thisMonthRevenue || 0, 1);
  const growth =
    revenue.lastMonthRevenue > 0 && revenue.thisMonthRevenue != null
      ? ((revenue.thisMonthRevenue - revenue.lastMonthRevenue) / revenue.lastMonthRevenue) * 100
      : null;
  const ready = !loading && !error && Boolean(overview);

  return (
    <div className="reference-dashboard max-w-7xl mx-auto">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="reference-muted mt-0.5">
            System overview, revenue trends, and facility capacity across the enterprise.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <label className="reference-search">
            <Search size={16} strokeWidth={1.8} className="text-slate-400" />
            <input
              type="search"
              aria-label="Search facility"
              placeholder="Search facilities..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="reference-outline-button"
            type="button"
            disabled={!ready || !facilities.length}
            onClick={() => exportFacilities(facilities)}
          >
            <Upload size={14} />
            <span>Export CSV</span>
          </button>
          <button
            className="reference-outline-button"
            type="button"
            disabled={!ready}
            onClick={() => window.print()}
          >
            <Download size={14} />
            <span>Print</span>
          </button>
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={reload}
            aria-label={error ? "Retry loading data" : "Refresh data"}
            title="Refresh data"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && (
        <div role="status" aria-live="polite">
          <p className="reference-muted mb-4">Loading system analytics...</p>
          <div className="reference-overview-grid">
            {[1, 2, 3].map((id) => (
              <div className="admin-skeleton h-80 rounded-xl" key={id} />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="reference-error">
          <TriangleAlert size={20} />
          <div>
            <strong>Unable to load dashboard</strong>
            <p>{error}</p>
            <button type="button" onClick={reload}>Retry</button>
          </div>
        </div>
      )}

      {ready && (
        <>
          {/* Top 3 KPI Cards */}
          <div className="reference-overview-grid">
            <div className="reference-summary-stack">
              <SummaryCard
                label="Total Customers"
                value={users.totalCustomers}
                detail={`${format(users.totalUsers)} accounts · ${format(users.totalStaff)} staff`}
                icon={Users}
                to="/admin-users"
                linkLabel="Manage Accounts"
              />
              <SummaryCard
                label="Total Storage Units"
                value={occupancy.totalStorageUnits}
                detail={`${format(occupancy.totalFacilities)} facilities network-wide`}
                icon={Building2}
                to="/admin-facilities"
                linkLabel="View All Facilities"
                badge={`${format(occupancy.availableUnits)} available`}
              />
            </div>

            {/* Revenue Card (Royal Blue accent) */}
            <section className="reference-card reference-revenue">
              <div className="reference-card-heading">
                <h2>Revenue This Month</h2>
                <span className="reference-chart-icon">
                  <ChartNoAxesCombined size={20} strokeWidth={1.8} />
                </span>
              </div>
              <strong className="reference-revenue-value" title={format(revenue.thisMonthRevenue, "money")}>
                {format(revenue.thisMonthRevenue, "money")}
              </strong>
              <div className="reference-growth">
                {growth !== null ? (
                  <span className={growth >= 0 ? "reference-lime" : "reference-negative"}>
                    {growth > 0 ? "+" : ""}
                    {format(growth, "rate")} <ArrowUpRight size={12} />
                  </span>
                ) : (
                  <span className="reference-muted">No baseline</span>
                )}
                {growth !== null && <span className="reference-muted">vs last month</span>}
              </div>
              <div className="reference-chart-legend">
                <span><i className="reference-solid-key" />This month</span>
                <span><i className="reference-stripe-key" />Last month</span>
              </div>
              <div
                className="reference-revenue-chart"
                role="img"
                aria-label={`Previous month revenue: ${format(revenue.lastMonthRevenue, "money")}. This month revenue: ${format(revenue.thisMonthRevenue, "money")}.`}
              >
                <div className="reference-chart-axis">
                  {[1, 0.75, 0.5, 0.25, 0].map((fraction) => (
                    <span key={fraction}>{compactMoney.format((revenueMax === 1 ? 0 : revenueMax) * fraction)}</span>
                  ))}
                </div>
                <div className="reference-chart-columns">
                  {[
                    ["Last month", revenue.lastMonthRevenue, "striped"],
                    ["This month", revenue.thisMonthRevenue, "solid"],
                  ].map(([label, value, kind]) => (
                    <div key={kind} className="reference-chart-column">
                      <div className="reference-bar-space">
                        <div
                          className={`reference-vertical-bar ${kind}`}
                          style={{ height: `${clamp(((value || 0) / revenueMax) * 100)}%` }}
                        >
                          <span>{value == null ? "—" : compactMoney.format(value)}</span>
                        </div>
                      </div>
                      <span className="reference-month-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reference-revenue-foot">
                <span>Total Corporate Revenue</span>
                <strong>{format(revenue.totalRevenue, "money")}</strong>
              </div>
            </section>

            {/* Occupancy Donut Chart */}
            <OccupancyChart occupancy={occupancy} />
          </div>

          {/* Consolidated 100% Full-Width Facility Overview Table with Inline Progress Bars */}
          <div className="reference-details-grid">
            <section className="reference-card reference-table-card">
              <div className="reference-card-heading">
                <div>
                  <h2>Facility Overview</h2>
                  <p className="reference-muted">Monitor facility capacity, real-time occupancy rates, and operational status.</p>
                </div>
                <Link className="reference-pill reference-view-all hover:bg-slate-100 transition" to="/admin-facilities">
                  Manage Facilities <ArrowRight size={14} />
                </Link>
              </div>

              <div className="reference-table-scroll">
                <table className="reference-table">
                  <thead>
                    <tr>
                      <th scope="col">Facility</th>
                      <th scope="col">City</th>
                      <th scope="col">Total Units</th>
                      <th scope="col">Occupied</th>
                      <th scope="col">Available</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="min-w-[180px]">Occupancy Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map((facility) => {
                      const rate = Number(facility.occupancyRate) || 0;
                      const occupied = Number(facility.occupiedUnits) || 0;
                      const total = Number(facility.totalUnits) || 0;
                      return (
                        <tr key={facility.facilityId}>
                          <td>
                            <div className="reference-facility-name">
                              <span className="reference-facility-thumb">
                                <Building2 size={16} strokeWidth={1.8} />
                              </span>
                              <div>
                                <strong>{facility.facilityName || "—"}</strong>
                                <small>{facility.facilityCode || "—"}</small>
                              </div>
                            </div>
                          </td>
                          <td>{facility.city || "—"}</td>
                          <td><span className="font-semibold text-slate-900">{format(facility.totalUnits)}</span></td>
                          <td><span className="text-blue-600 font-semibold">{format(facility.occupiedUnits)}</span></td>
                          <td><span className="text-emerald-600 font-semibold">{format(facility.availableUnits)}</span></td>
                          <td>
                            <span className={`reference-status ${String(facility.status).toLowerCase()}`}>
                              {statuses[String(facility.status).toLowerCase()] || facility.status || "—"}
                            </span>
                          </td>
                          <td>
                            {/* Modern Inline Occupancy Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-28 sm:w-36 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    rate >= 80 ? "bg-amber-500" : rate > 0 ? "bg-blue-600" : "bg-slate-300"
                                  }`}
                                  style={{ width: `${clamp(rate)}%` }}
                                />
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {format(rate, "rate")}
                                <span className="ml-1 text-[10px] font-normal text-slate-400">
                                  ({occupied}/{total})
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!facilities.length && (
                <div className="admin-empty py-8 text-center">
                  <Boxes size={28} className="mx-auto text-slate-400 mb-2" />
                  <strong className="block text-slate-800">{query ? "No matching facilities found" : "No facilities registered"}</strong>
                  <p className="text-xs text-slate-500 mt-1">{query ? "Try searching with a different name, code or city." : "Facility records will appear here once configured."}</p>
                  {query && (
                    <button type="button" onClick={() => setQuery("")} className="mt-2 text-xs font-semibold text-blue-600 underline">
                      Clear search
                    </button>
                  )}
                </div>
              )}

              <div className="reference-table-footer">
                <span>Showing {facilities.length} / {overview.facilityBreakdown.length} facilities network-wide</span>
                <span className="font-semibold text-slate-700">{format(users.activeRentals)} active rental agreements</span>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

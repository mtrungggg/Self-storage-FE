import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Building2, Users, RefreshCw, Boxes, Search, Download, Upload, TriangleAlert, ChartNoAxesCombined } from "lucide-react";
import adminDashboardService from "../api/adminDashboardService";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const format = (value, type) => value == null ? "—" : type === "money" ? money.format(value) : number.format(value) + (type === "rate" ? "%" : "");
const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const statuses = { active: "Active", inactive: "Inactive", maintenance: "Maintenance" };

function exportFacilities(facilities) {
  // Quote CSV fields and neutralize spreadsheet formulas in server-provided text.
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
  const url = URL.createObjectURL(new Blob(["\uFEFF", rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "facility-operations-report.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SummaryCard({ label, value, detail, icon: Icon, to, linkLabel, badge }) {
  return <article className="reference-card reference-summary">
    <p className="reference-card-label">{label}</p>
    <div className="reference-summary-value"><strong>{format(value)}</strong>{badge && <span className="reference-lime">{badge}</span>}</div>
    <span className="reference-summary-icon"><Icon size={24} strokeWidth={1.4} /></span>
    <p className="reference-muted">{detail}</p>
    <Link className="reference-card-link" to={to}><span>{linkLabel}</span><ArrowRight size={19} strokeWidth={1.5} /></Link>
  </article>;
}

function OccupancyChart({ occupancy }) {
  const segments = [
    ["Occupied", occupancy.occupiedUnits, "#100b20"],
    ["Available", occupancy.availableUnits, "#b6b6b6"],
    ["Reserved", occupancy.reservedUnits, "#d2d2d2"],
    ["Maintenance", occupancy.maintenanceUnits, "#e5e5e5"],
  ];
  const total = segments.reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0);
  let offset = 0;
  return <section className="reference-card reference-occupancy">
    <div className="reference-card-heading"><h2>Unit Distribution</h2><span className="reference-pill">Network-wide</span></div>
    <div className="reference-ring-wrap">
      <svg className="reference-ring" viewBox="0 0 240 240" role="img" aria-label={`Unit distribution. Occupancy rate: ${format(occupancy.systemOccupancyRate, "rate")}`}>
        <circle cx="120" cy="120" r="91" fill="none" stroke="#e8e8e8" strokeWidth="28" />
        {segments.map(([label, value, color]) => {
          const share = total ? Math.max(0, Number(value) || 0) / total * 100 : 0;
          const start = offset;
          offset += share;
          return share > 0 && <circle key={label} cx="120" cy="120" r="91" fill="none" stroke={color} strokeWidth="28" pathLength="100" strokeDasharray={`${Math.max(0, share - 0.8)} ${100 - Math.max(0, share - 0.8)}`} strokeDashoffset={-start} transform="rotate(-90 120 120)" />;
        })}
      </svg>
      <div className="reference-ring-center"><strong>{format(occupancy.totalStorageUnits)}</strong><span className="reference-lime">{format(occupancy.systemOccupancyRate, "rate")} occupied</span></div>
    </div>
    <div className="reference-ring-legend">{segments.map(([label, value, color]) => <div key={label}><span style={{ background: color }} /><span>{label}</span><strong>{format(value)}</strong></div>)}</div>
    <div className="reference-ring-total"><span>Total Facilities</span><strong>{format(occupancy.totalFacilities)}</strong></div>
  </section>;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [ranking, setRanking] = useState("occupancyRate");
  const reload = useCallback(() => { setLoading(true); setError(""); setReloadKey((key) => key + 1); }, []);

  useEffect(() => {
    let active = true;
    adminDashboardService.getOverview()
      .then((data) => { if (active) setOverview(data); })
      .catch((err) => { if (active) setError(err.message || "Failed to load dashboard metrics."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);
  useEffect(() => {
    window.addEventListener("admin-data-changed", reload);
    return () => window.removeEventListener("admin-data-changed", reload);
  }, [reload]);

  const revenue = overview?.revenueKpi || {};
  const occupancy = overview?.occupancyKpi || {};
  const users = overview?.userKpi || {};
  const facilities = (overview?.facilityBreakdown || []).filter((item) => [item.facilityName, item.facilityCode, item.city].some((value) => String(value || "").toLowerCase().includes(query.trim().toLowerCase())));
  const rankedFacilities = [...(overview?.facilityBreakdown || [])].sort((a, b) => (b[ranking] || 0) - (a[ranking] || 0)).slice(0, 4);
  const revenueMax = Math.max(revenue.lastMonthRevenue || 0, revenue.thisMonthRevenue || 0, 1);
  const growth = revenue.lastMonthRevenue > 0 && revenue.thisMonthRevenue != null ? (revenue.thisMonthRevenue - revenue.lastMonthRevenue) / revenue.lastMonthRevenue * 100 : null;
  const ready = !loading && !error && Boolean(overview);

  return <div className="reference-dashboard">
    <div className="reference-toolbar">
      <h1>Admin Dashboard</h1>
      <div className="reference-toolbar-actions">
        <label className="reference-search"><Search size={18} strokeWidth={1.5} /><input type="search" aria-label="Search facility" placeholder="Search facilities..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <button className="reference-outline-button" type="button" disabled={!ready || !facilities.length} onClick={() => exportFacilities(facilities)}><Upload size={16} />Export CSV</button>
        <button className="reference-outline-button" type="button" disabled={!ready} onClick={() => window.print()}><Download size={16} />Print</button>
        <button className="reference-refresh" type="button" disabled={loading} onClick={reload} aria-label={error ? "Retry loading data" : "Refresh data"} title="Refresh data"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button>
      </div>
    </div>
    {loading && <div role="status" aria-live="polite"><p className="reference-muted mb-4">Loading system analytics...</p><div className="reference-overview-grid">{[1, 2, 3].map((id) => <div className="admin-skeleton h-96 rounded-[28px]" key={id} />)}</div></div>}
    {!loading && error && <div role="alert" className="reference-error"><TriangleAlert size={22} /><div><strong>Unable to load dashboard</strong><p>{error}</p><button type="button" onClick={reload}>Retry</button></div></div>}
    {ready && <>
      <div className="reference-overview-grid">
        <div className="reference-summary-stack">
          <SummaryCard label="Total Customers" value={users.totalCustomers} detail={`${format(users.totalUsers)} accounts · ${format(users.totalStaff)} staff`} icon={Users} to="/admin-users" linkLabel="Manage Accounts" />
          <SummaryCard label="Total Storage Units" value={occupancy.totalStorageUnits} detail={`${format(occupancy.totalFacilities)} facilities network-wide`} icon={Building2} to="/admin-facilities" linkLabel="View All Facilities" badge={`${format(occupancy.availableUnits)} available`} />
        </div>
        <section className="reference-card reference-revenue">
          <div className="reference-card-heading"><h2>Revenue This Month</h2><span className="reference-chart-icon"><ChartNoAxesCombined size={22} strokeWidth={1.5} /></span></div>
          <strong className="reference-revenue-value" title={format(revenue.thisMonthRevenue, "money")}>{format(revenue.thisMonthRevenue, "money")}</strong>
          <div className="reference-growth">{growth !== null ? <span className={growth >= 0 ? "reference-lime" : "reference-negative"}>{growth > 0 ? "+" : ""}{format(growth, "rate")} <ArrowUpRight size={12} /></span> : <span className="reference-muted">No baseline</span>}{growth !== null && <span className="reference-muted">vs last month</span>}</div>
          <div className="reference-chart-legend"><span><i className="reference-solid-key" />This month</span><span><i className="reference-stripe-key" />Last month</span></div>
          <div className="reference-revenue-chart" role="img" aria-label={`Previous month revenue: ${format(revenue.lastMonthRevenue, "money")}. This month revenue: ${format(revenue.thisMonthRevenue, "money")}.`}>
            <div className="reference-chart-axis">{[1, .75, .5, .25, 0].map((fraction) => <span key={fraction}>{compactMoney.format((revenueMax === 1 ? 0 : revenueMax) * fraction)}</span>)}</div>
            <div className="reference-chart-columns">{[["Last month", revenue.lastMonthRevenue, "striped"], ["This month", revenue.thisMonthRevenue, "solid"]].map(([label, value, kind]) => <div key={kind} className="reference-chart-column"><div className="reference-bar-space"><div className={`reference-vertical-bar ${kind}`} style={{ height: `${clamp((value || 0) / revenueMax * 100)}%` }}><span>{value == null ? "—" : compactMoney.format(value)}</span></div></div><span className="reference-month-label">{label}</span></div>)}</div>
          </div>
          <div className="reference-revenue-foot"><span>Total Revenue</span><strong>{format(revenue.totalRevenue, "money")}</strong></div>
        </section>
        <OccupancyChart occupancy={occupancy} />
      </div>
      <div className="reference-details-grid">
        <section className="reference-card reference-table-card">
          <div className="reference-card-heading"><div><h2>Facility Overview</h2><p className="reference-muted">Monitor facility capacity and operational metrics.</p></div><Link className="reference-pill reference-view-all" to="/admin-facilities">View all <ArrowRight size={15} /></Link></div>
          <div className="reference-table-scroll"><table className="reference-table"><thead><tr>{["Facility", "City", "Total Units", "Occupied", "Available", "Status", "Occupancy"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{facilities.map((facility) => <tr key={facility.facilityId}>
            <td><div className="reference-facility-name"><span className="reference-facility-thumb"><Building2 size={19} strokeWidth={1.5} /></span><div><strong>{facility.facilityName || "—"}</strong><small>{facility.facilityCode || "—"}</small></div></div></td>
            <td>{facility.city || "—"}</td><td>{format(facility.totalUnits)}</td><td>{format(facility.occupiedUnits)}</td><td>{format(facility.availableUnits)}</td><td><span className={`reference-status ${String(facility.status).toLowerCase()}`}>{statuses[String(facility.status).toLowerCase()] || facility.status || "—"}</span></td><td><strong>{format(facility.occupancyRate, "rate")}</strong></td>
          </tr>)}</tbody></table></div>
          {!facilities.length && <div className="admin-empty"><Boxes size={28} /><strong>{query ? "No matching facilities found" : "No facilities registered"}</strong><p>{query ? "Try searching with a different name, code or city." : "Facility records will appear here once configured."}</p>{query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}</div>}
          <div className="reference-table-footer"><span>{facilities.length} / {overview.facilityBreakdown.length} facilities</span><span>{format(users.activeRentals)} active rental agreements</span></div>
        </section>
        <section className="reference-card reference-ranking">
          <div className="reference-card-heading"><h2>Facility Capacity</h2><select className="reference-pill" aria-label="Sort facilities by" value={ranking} onChange={(event) => setRanking(event.target.value)}><option value="occupancyRate">Occupancy</option><option value="availableUnits">Available</option></select></div>
          {rankedFacilities.length ? <>
            <div className="reference-top-facility"><span className="reference-top-icon"><Building2 size={28} strokeWidth={1.3} /></span><div><strong>{rankedFacilities[0].facilityName}</strong><small>{rankedFacilities[0].city || "Unassigned City"}</small><span>{format(rankedFacilities[0][ranking], ranking === "occupancyRate" ? "rate" : undefined)} {ranking === "occupancyRate" ? "occupied" : "available units"}</span></div></div>
            <div className="reference-ranking-chart">{rankedFacilities.map((facility) => <div key={facility.facilityId} className="reference-ranking-column"><div className="reference-ranking-track"><div style={{ height: `${clamp((facility[ranking] || 0) / Math.max(...rankedFacilities.map((item) => item[ranking] || 0), 1) * 100)}%` }}><span>{format(facility[ranking], ranking === "occupancyRate" ? "rate" : undefined)}</span></div></div><span title={facility.facilityName}>{facility.facilityCode || facility.facilityName}</span></div>)}</div>
          </> : <div className="admin-empty"><Building2 size={28} /><p>No capacity metrics available.</p></div>}
          <div className="reference-invoice-summary"><span>Invoices <strong>{format(revenue.totalInvoices)}</strong></span><span>Paid <strong>{format(revenue.paidInvoices)}</strong></span><span>Open <strong>{format(revenue.openInvoices)}</strong></span><span>Overdue <strong>{format(revenue.overdueInvoices)}</strong></span></div>
        </section>
      </div>
    </>}
  </div>;
}

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { FacilityBarActions } from "../components/FacilitySwitcher";
import { formatVnd } from "../lib/utils";

export default function ManagerDashboard() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await managerService.getDashboard(facilityId);
      setData(res);
    } catch (err) {
      setError(err?.message || "Unable to load facility dashboard.");
    } finally {
      setLoading(false);
    }
  }, [facilityId, facilityLoading]);

  useEffect(() => {
    if (!facilityLoading && !facilityId) {
      setLoading(false);
    } else if (facilityId) {
      loadDashboard();
    }
  }, [facilityId, facilityLoading, loadDashboard]);

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
    <div className="space-y-4">
      {/* Top Facility Bar Action: Refresh button placed in FacilitySwitcher */}
      <FacilityBarActions>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading || facilityLoading || !facilityId}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </FacilityBarActions>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <p className="font-semibold">{error}</p>
          <button type="button" onClick={loadDashboard} className="mt-1 font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="rounded-lg border border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
          Loading dashboard data...
        </div>
      )}

      {/* Main Content */}
      {(!loading || data) && (
        <>
          {/* Top 4 Key KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Occupancy Rate */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Occupancy Rate
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {Number(stats.occupancyRate || 0).toFixed(1)}%
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Occupied: {stats.occupiedUnits} / {stats.totalUnits}</span>
                <span className="font-medium text-emerald-600">Available: {stats.availableUnits}</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.min(100, Math.max(0, stats.occupancyRate))}%` }}
                />
              </div>
            </div>

            {/* This Month Revenue */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Month Revenue
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {formatVnd(stats.thisMonthRevenue)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Monthly billed storage revenue
              </div>
            </div>

            {/* Outstanding Debt */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overdue Debt
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-600">
                {formatVnd(stats.totalOutstandingDebt)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Action required</span>
                <Link to="/manager-delinquent-cases" className="font-semibold text-rose-600 hover:underline">
                  Review &rarr;
                </Link>
              </div>
            </div>

            {/* Open / Urgent Tickets */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Open Tickets
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.openTicketsCount}</span>
                {stats.urgentTicketsCount > 0 && (
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-600 border border-rose-200">
                    {stats.urgentTicketsCount} urgent
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Facility tasks</span>
                <Link to="/manager-tickets" className="font-semibold text-blue-600 hover:underline">
                  View tickets &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Today's Daily Schedule & Inventory Overview */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Today's Operational Schedule */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Today Schedule</h2>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Real-time
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/70 p-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Check-in Expected</div>
                    <div className="text-xs text-slate-500">New customer move-in</div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {stats.dailySchedule.todayCheckInsCount}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/70 p-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Check-out</div>
                    <div className="text-xs text-slate-500">Move-out / Agreement end</div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {stats.dailySchedule.todayCheckOutsCount}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/70 p-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Unit Inspections</div>
                    <div className="text-xs text-slate-500">Maintenance &amp; condition review</div>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {stats.dailySchedule.todayInspectionsCount}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  to="/manager-tickets"
                  className="block text-center text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Facility Tickets &amp; Tasks &rarr;
                </Link>
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Unit Status Distribution</h2>
                <Link to="/manager-units" className="text-xs font-semibold text-blue-600 hover:underline">
                  Units &amp; Layout &rarr;
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center">
                  <div className="text-xs font-medium text-slate-500">Total</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{stats.totalUnits}</div>
                  <div className="mt-0.5 text-xs text-slate-400">All Units</div>
                </div>
                <div className="rounded-md border border-blue-200 bg-blue-50/70 p-3 text-center">
                  <div className="text-xs font-medium text-blue-700">Occupied</div>
                  <div className="mt-1 text-xl font-bold text-blue-900">{stats.occupiedUnits}</div>
                  <div className="mt-0.5 text-xs text-blue-600">Active</div>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                  <div className="text-xs font-medium text-emerald-700">Available</div>
                  <div className="mt-1 text-xl font-bold text-emerald-900">{stats.availableUnits}</div>
                  <div className="mt-0.5 text-xs text-emerald-600">Ready</div>
                </div>
                <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3 text-center">
                  <div className="text-xs font-medium text-amber-700">Reserved</div>
                  <div className="mt-1 text-xl font-bold text-amber-900">{stats.reservedUnits}</div>
                  <div className="mt-0.5 text-xs text-amber-600">Pending</div>
                </div>
                <div className="rounded-md border border-rose-200 bg-rose-50/70 p-3 text-center">
                  <div className="text-xs font-medium text-rose-700">Maintenance</div>
                  <div className="mt-1 text-xl font-bold text-rose-900">{stats.maintenanceUnits}</div>
                  <div className="mt-0.5 text-xs text-rose-600">Repair</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

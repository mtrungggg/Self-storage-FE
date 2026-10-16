import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import StaffReservationLookup from "../components/StaffReservationLookup";
import StaffMoveOutTab from "../components/StaffMoveOutTab";
import StaffFacilityUnits from "../components/StaffFacilityUnits";
import StaffOverdueAgreements from "../components/StaffOverdueAgreements";
import StaffTaskStatus from "../components/StaffTaskStatus";
import { useAuth } from "../hooks/useAuth";
import staffFacilityService from "../api/staffFacilityService";
import staffReservationService from "../api/staffReservationService";
import staffAgreementService from "../api/staffAgreementService";
import staffSupportService from "../api/staffSupportService";
import staffTaskService from "../api/staffTaskService";
import facilityService from "../api/facilityService";

export default function StaffDashboard() {
  const { user } = useAuth();

  // Selected operational facility (1 = HCM-TD, 2 = HCM-D7)
  const [selectedFacilityId, setSelectedFacilityId] = useState("1");
  const [activeTab, setActiveTab] = useState("checkin"); // 'checkin' | 'moveout' | 'units' | 'overdue' | 'issues'

  // Dynamic Metrics State
  const [facilities, setFacilities] = useState([]);
  const [units, setUnits] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [overdueAgreements, setOverdueAgreements] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Active task type filter inside Issues tab
  const [activeTaskType, setActiveTaskType] = useState("all");

  const requestId = useRef(0);

  // Fetch all real-time operational data from backend
  const loadDashboardData = async (facilityId = selectedFacilityId) => {
    const currentRequest = ++requestId.current;
    setLoadingMetrics(true);

    try {
      const [unitsRes, rsvRes, tasksRes, overdueRes, ticketsRes, facilitiesRes] = await Promise.allSettled([
        staffFacilityService.getUnits(Number(facilityId)),
        staffReservationService.lookup("", facilityId),
        staffTaskService.getTasks(facilityId),
        staffAgreementService.getOverdueAgreements(facilityId),
        staffSupportService.getTickets({ facilityId: Number(facilityId) }),
        facilityService.getFacilities(),
      ]);

      if (currentRequest !== requestId.current) return;

      if (unitsRes.status === "fulfilled") setUnits(unitsRes.value || []);
      if (rsvRes.status === "fulfilled") setReservations(rsvRes.value || []);
      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value || []);
      if (overdueRes.status === "fulfilled") setOverdueAgreements(overdueRes.value || []);
      if (ticketsRes.status === "fulfilled") setSupportTickets(ticketsRes.value || []);
      if (facilitiesRes.status === "fulfilled") setFacilities(facilitiesRes.value || []);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingMetrics(false);
      }
    }
  };

  useEffect(() => {
    loadDashboardData(selectedFacilityId);
    return () => {
      requestId.current++;
    };
  }, [selectedFacilityId]);

  // Derived real KPI statistics
  const totalUnits = units.length;
  const vacantUnits = units.filter(
    (u) => u.status === "available" || u.status === "vacant"
  ).length;
  const occupiedUnits = units.filter(
    (u) => u.status === "occupied" || u.status === "rented"
  ).length;
  const pendingUnits = units.filter(
    (u) => u.status === "reserved" || u.status === "pending"
  ).length;
  const maintenanceUnits = units.filter(
    (u) => u.status === "maintenance" || u.status === "under_maintenance"
  ).length;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "done"
  ).length;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);

  const confirmedReservations = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "pending"
  ).length;

  const lockedAccessCount = overdueAgreements.filter((a) => a.accessLocked).length;

  const openTickets = supportTickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  );
  const openIssuesCount = pendingTasks + openTickets.length;

  const staffFacility = useMemo(() => {
    const fId = tasks[0]?.facilityId || user?.facilityId || selectedFacilityId || 1;
    return (
      facilities.find((f) => String(f.id) === String(fId)) || {
        id: fId,
        facilityCode: String(fId) === "2" ? "HCM-D7" : "HCM-TD",
        facilityName: String(fId) === "2" ? "District 7 Facility" : "Thu Duc Facility",
        address: String(fId) === "2" ? "District 7, Ho Chi Minh City" : "Thu Duc City, Ho Chi Minh City",
      }
    );
  }, [facilities, tasks, user, selectedFacilityId]);

  // Task categories filter
  const taskTabs = useMemo(() => [
    { id: "all", label: "All Tasks", count: tasks.length },
    ...[...new Set(tasks.map((task) => task.taskType).filter(Boolean))].map((type) => ({
      id: type,
      label: type.replaceAll("_", " "),
      count: tasks.filter((task) => task.taskType === type).length,
    })),
  ], [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => activeTaskType === "all" || task.taskType === activeTaskType),
    [tasks, activeTaskType]
  );

  const handleUpdateTask = (updated) => {
    setTasks((current) =>
      current.map((task) => (task.id === updated.id ? updated : task))
    );
  };

  const handleClaimTicket = async (ticketId) => {
    try {
      await staffSupportService.assignTicket(ticketId);
      loadDashboardData(selectedFacilityId);
    } catch (err) {
      alert(err.message || "Unable to claim ticket.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      <PageBackground />

      {/* Shared Portal Header without Customer Links */}
      <Header active="ops" hideCustomerNav={true} />

      {/* Main Operations Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">

        {/* 4 Informational KPI Stat Cards (Strictly Non-Clickable) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {/* KPI 1: Check-in Queue */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Check-in</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {loadingMetrics ? "..." : String(confirmedReservations).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-blue-600">Pending</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1d5fe5] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          </div>

          {/* KPI 2: Shift Tasks */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Tasks</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {loadingMetrics ? "..." : String(completedTasks).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ {totalTasks}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>

          {/* KPI 3: Security & Overdue */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Overdue</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-red-600">
                  {loadingMetrics ? "..." : String(overdueAgreements.length).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-500">{lockedAccessCount} locked</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* KPI 4: Occupancy */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Occupancy</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {loadingMetrics ? "..." : `${occupancyRate}%`}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {vacantUnits} free
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Center Grid: 2 Columns (7 cols left, 5 cols right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (7 cols): Main Navigation Tabs & Operational Modules */}
          <div className="lg:col-span-7 space-y-5">

            {/* Main Tabs Container */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("checkin")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "checkin"
                      ? "bg-[#1d5fe5] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Check-in
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("moveout")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "moveout"
                      ? "bg-[#1d5fe5] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Move-out
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("units")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "units"
                      ? "bg-[#1d5fe5] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Units
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overdue")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "overdue"
                      ? "bg-[#1d5fe5] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Overdue
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("issues")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "issues"
                      ? "bg-[#1d5fe5] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Issues ({openIssuesCount})
                </button>
              </div>

              {/* Dynamic Module Based on Active Tab */}
              <div className="pt-2 border-t border-slate-100">
                {activeTab === "checkin" && (
                  <StaffReservationLookup />
                )}

                {activeTab === "moveout" && (
                  <StaffMoveOutTab facilityId={selectedFacilityId} />
                )}

                {activeTab === "units" && (
                  <StaffFacilityUnits initialFacilityId={selectedFacilityId} />
                )}

                {activeTab === "overdue" && (
                  <StaffOverdueAgreements initialFacilityId={selectedFacilityId} />
                )}

                {activeTab === "issues" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-700 uppercase">Tasks</h3>
                      <div className="flex flex-wrap gap-1">
                        {taskTabs.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTaskType(t.id)}
                            className={`px-2.5 py-1 text-xs rounded-md font-semibold capitalize transition ${
                              activeTaskType === t.id
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {t.label} ({t.count})
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        No tasks.
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="text-xs font-bold text-slate-900">
                                {task.title || `Task #${task.id}`}
                              </strong>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {task.facilityCode || "HCM-TD"} • {task.status}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#1d5fe5]">
                              {task.progressPercent ?? 0}%
                            </span>
                          </div>
                          <div>
                            <StaffTaskStatus task={task} onUpdated={handleUpdateTask} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Support Tickets Live Feed */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tickets</h2>
                <Link
                  to="/staff-support-tickets"
                  className="text-xs font-semibold text-[#1d5fe5] hover:text-[#1550c7]"
                >
                  All →
                </Link>
              </div>

              {openTickets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No open tickets.
                </div>
              ) : (
                <div className="space-y-2">
                  {openTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            {ticket.ticketNo || `#${ticket.id}`}
                          </span>
                          <span className="text-xs font-medium text-slate-800 truncate">
                            {ticket.subject || ticket.description || "Support"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleClaimTicket(ticket.id)}
                            className="text-xs font-semibold bg-[#1d5fe5] hover:bg-[#1550c7] text-white px-2.5 py-1 rounded transition-colors"
                          >
                            Claim
                          </button>
                          <Link
                            to="/staff-support-tickets"
                            className="text-xs font-semibold border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-100"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (5 cols): Smart Floorplan & Staff Duty Facility Presence */}
          <div className="lg:col-span-5 space-y-5">

            {/* Smart Floorplan Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Floorplan</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("units")}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
                >
                  Expand
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-slate-100 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80"
                  alt="Floorplan"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {staffFacility?.facilityCode || "HCM-TD"}
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : vacantUnits}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-medium">Free</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : occupiedUnits}
                  </span>
                  <span className="block text-[10px] text-blue-700 font-medium">Rented</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : pendingUnits}
                  </span>
                  <span className="block text-[10px] text-amber-700 font-medium">Pending</span>
                </div>
                <div className="bg-red-50 border border-red-100 py-1.5 rounded-lg">
                  <span className="block text-xs font-bold text-slate-900">
                    {loadingMetrics ? "..." : maintenanceUnits}
                  </span>
                  <span className="block text-[10px] text-red-700 font-medium">Maint.</span>
                </div>
              </div>
            </div>

            {/* Staff Assigned Facility Presence Card */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs h-32 bg-slate-900">
              <img
                src={
                  staffFacility?.imageUrl ||
                  staffFacility?.photoUrl ||
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                }
                alt={staffFacility?.facilityName || "Facility"}
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
                <div>
                  <p className="text-xs font-bold text-white">
                    {staffFacility?.facilityName || "Facility Hub"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {staffFacility?.facilityCode || "HCM-TD"} • {totalUnits} units
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Online
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Shared Portal Footer */}
      <Footer />
    </div>
  );
}

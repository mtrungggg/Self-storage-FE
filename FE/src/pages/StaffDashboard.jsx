import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import StaffUnitGrid from "../components/StaffUnitGrid";
import StaffWalkInBooking from "../components/StaffWalkInBooking";
import StaffQrOperations from "../components/StaffQrOperations";
import StaffLogisticsTickets from "../components/StaffLogisticsTickets";
import StaffShiftSchedule from "../components/StaffShiftSchedule";
import { useAuth } from "../hooks/useAuth";
import staffFacilityService from "../api/staffFacilityService";
import staffSupportService from "../api/staffSupportService";
import { STORAGE_UNIT_STATUS } from "../constants/rentalConstants";

export default function StaffDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("units"); // 'units' | 'booking' | 'qr' | 'tickets'
  const [assignedFacility, setAssignedFacility] = useState(null);
  const [units, setUnits] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const requestId = useRef(0);

  const loadWorkspaceData = async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);

    try {
      let facilityInfo = null;
      try {
        facilityInfo = await staffFacilityService.getMyFacility();
      } catch (err) {
        console.warn("Could not load assigned facility:", err);
      }

      if (currentRequest !== requestId.current) return;
      if (facilityInfo) setAssignedFacility(facilityInfo);

      const targetFacilityId = facilityInfo?.facilityId || undefined;

      const [unitsRes, ticketsRes] = await Promise.allSettled([
        staffFacilityService.getUnits(targetFacilityId),
        staffSupportService.getTickets({ facilityId: targetFacilityId }),
      ]);

      if (currentRequest !== requestId.current) return;

      if (unitsRes.status === "fulfilled") {
        const uList = unitsRes.value || [];
        setUnits(uList);
        if (!facilityInfo && uList.length > 0) {
          setAssignedFacility({
            facilityId: uList[0].facilityId,
            facilityName: uList[0].facilityName,
            facilityCode: "",
            totalUnits: uList.length,
          });
        }
      }

      if (ticketsRes.status === "fulfilled") {
        setTickets(ticketsRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load staff workspace data:", err);
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWorkspaceData();
    return () => {
      requestId.current++;
    };
  }, []);

  const totalUnits = units.length;
  const vacantUnits = units.filter(
    (u) => u.physicalStatus === STORAGE_UNIT_STATUS.AVAILABLE || u.physicalStatus === "available" || u.physicalStatus === "vacant"
  ).length;
  const occupiedUnits = units.filter(
    (u) => u.physicalStatus === STORAGE_UNIT_STATUS.OCCUPIED || u.physicalStatus === "occupied" || u.physicalStatus === "rented"
  ).length;
  const reservedUnits = units.filter(
    (u) => u.physicalStatus === STORAGE_UNIT_STATUS.RESERVED || u.physicalStatus === "reserved" || u.physicalStatus === "pending"
  ).length;
  const openTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;

  const currentFacilityId = assignedFacility?.facilityId;

  return (
    <div className="relative min-h-screen text-[#0b1c30] flex flex-col font-sans bg-slate-50/50">
      <PageBackground />
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header: Staff identity & Assigned Facility */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Staff Workspace
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Shift Duties & Counter Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <span className="font-semibold text-slate-800">{user?.fullName || user?.email || "Staff"}</span>
            </p>
          </div>

          {/* Assigned Facility Info Badge */}
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs text-right">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block leading-tight">
              Assigned Facility
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-slate-800">
                {assignedFacility ? assignedFacility.facilityName : "Loading..."}
              </span>
              {assignedFacility?.facilityCode ? (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold rounded">
                  {assignedFacility.facilityCode}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Metrics Row - Pure typographic cards (no icons) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Vacant Units</p>
            <h2 className="text-2xl font-black text-emerald-600 mt-1">{loading ? "..." : vacantUnits}</h2>
            <span className="text-[11px] text-slate-400">Available to rent</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Occupied Units</p>
            <h2 className="text-2xl font-black text-blue-600 mt-1">{loading ? "..." : occupiedUnits}</h2>
            <span className="text-[11px] text-slate-400">{totalUnits} total units</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Reserved Units</p>
            <h2 className="text-2xl font-black text-amber-600 mt-1">{loading ? "..." : reservedUnits}</h2>
            <span className="text-[11px] text-slate-400">Awaiting check-in</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Pending Tasks</p>
            <h2 className="text-2xl font-black text-purple-600 mt-1">{loading ? "..." : openTickets}</h2>
            <span className="text-[11px] text-slate-400">Cleaning & Maintenance</span>
          </div>
        </div>

        {/* Main Tabs (Pure text buttons, no icons) */}
        <div className="flex border-b border-slate-200 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("units")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "units"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Storage Units
          </button>

          <button
            onClick={() => setActiveTab("booking")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "booking"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Walk-in Rental
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === "qr"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            QR Scanner
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "tickets"
                ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Facility Tasks</span>
            {openTickets > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500 text-white">
                {openTickets}
              </span>
            )}
          </button>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            {activeTab === "units" && <StaffUnitGrid facilityId={currentFacilityId} />}
            {activeTab === "booking" && <StaffWalkInBooking facilityId={currentFacilityId} />}
            {activeTab === "qr" && <StaffQrOperations />}
            {activeTab === "tickets" && <StaffLogisticsTickets facilityId={currentFacilityId} />}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <StaffShiftSchedule facilityId={currentFacilityId} />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

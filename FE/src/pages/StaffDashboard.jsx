import { useEffect, useMemo, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Header from "../components/Header";

import Footer from "../components/Footer";

import PageBackground from "../components/PageBackground";

import StaffReservationLookup from "../components/StaffReservationLookup";

import StaffMoveOutTab from "../components/StaffMoveOutTab";

import StaffFacilityUnits from "../components/StaffFacilityUnits";

import StaffTaskStatus from "../components/StaffTaskStatus";

import StaffShiftSchedule from "../components/StaffShiftSchedule";


import { hasCapability, CAPABILITIES } from "../constants/roles";

import { useAuth } from "../hooks/useAuth";

import staffFacilityService from "../api/staffFacilityService";

import staffReservationService from "../api/staffReservationService";

import staffSupportService from "../api/staffSupportService";

import staffTaskService from "../api/staffTaskService";
import staffMoveOutService from "../api/staffMoveOutService";

import facilityService from "../api/facilityService";

import { STORAGE_UNIT_STATUS, RESERVATION_STATUS } from "../constants/rentalConstants";

import { TICKET_STATUS } from "../constants/ticketConstants";

import { useSignalR } from "../context/SignalRContext";

import { useLanguage } from "../context/LanguageContext";



function getTaskTypeLabel(type, isVi) {

  switch (type?.toLowerCase()) {

    case "support":

      return isVi ? "Hỗ trợ" : "Support";

    case "inspection":

      return isVi ? "Kiểm tra" : "Inspection";

    case "maintenance":

      return isVi ? "Bảo trì" : "Maintenance";

    case "check_in":

      return isVi ? "Nhận kho" : "Check-in";

    case "check_out":

      return isVi ? "Trả kho" : "Check-out";

    case "other":

      return isVi ? "Khác" : "Other";

    default:

      return type ? type.replaceAll("_", " ") : "";

  }

}



export default function StaffDashboard({ initialTab = "checkin" }) {

  const { user } = useAuth();

  const { t, translateStatus, lang } = useLanguage();

  const { subscribe, joinFacility, recentEvent } = useSignalR();



  const storageKey = user?.id ? `staff_selected_facility_id_${user.id}` : "staff_selected_facility_id";



  // Cơ sở vận hành đang chọn — được xác định từ API /staff/my-facility (phân công thật của nhân viên),

  // chỉ dùng giá trị lưu ở localStorage nếu đã từng được xác định trước đó trong phiên này.

  const [selectedFacilityId, setSelectedFacilityId] = useState(

    () => localStorage.getItem(storageKey) || null

  );

  const [myFacilityInfo, setMyFacilityInfo] = useState(null);

  const [activeTab, setActiveTab] = useState(initialTab === "overdue" ? "checkin" : initialTab); // 'checkin' | 'moveout' | 'units' | 'shifts' | 'issues'



  // Dynamic Metrics State

  const [facilities, setFacilities] = useState([]);

  const [units, setUnits] = useState([]);

  const [reservations, setReservations] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [supportTickets, setSupportTickets] = useState([]);

  const [loadingMetrics, setLoadingMetrics] = useState(true);



  const [moveOuts, setMoveOuts] = useState([]);



  // Single unified filter for Tasks inside Issues tab: 'all' | 'active' | 'done' | 'support' | 'inspection'

  const [taskFilter, setTaskFilter] = useState("all");



  const requestId = useRef(0);



  // Fetch all real-time operational data from backend

  const loadDashboardData = async (facilityId = selectedFacilityId) => {

    const currentRequest = ++requestId.current;

    setLoadingMetrics(true);



    try {

            const [unitsRes, rsvRes, tasksRes, ticketsRes, facilitiesRes, moveOutsRes] = await Promise.allSettled([
        staffFacilityService.getUnits(Number(facilityId)),
        staffReservationService.lookup("", facilityId),
        staffTaskService.getTasks(facilityId),
        staffSupportService.getTickets({ facilityId: Number(facilityId) }),
        facilityService.getFacilities(),
        staffMoveOutService.getMoveOuts({ facilityId: Number(facilityId) }),
      ]);



      if (currentRequest !== requestId.current) return;



      if (unitsRes.status === "fulfilled") setUnits(unitsRes.value || []);

      if (rsvRes.status === "fulfilled") setReservations(rsvRes.value || []);

      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value || []);

      if (ticketsRes.status === "fulfilled") setSupportTickets(ticketsRes.value || []);

      if (facilitiesRes.status === "fulfilled") setFacilities(facilitiesRes.value || []);
      if (moveOutsRes?.status === "fulfilled") setMoveOuts(moveOutsRes.value || []);

    } catch (err) {

      console.error("Failed to load dashboard metrics:", err);

    } finally {

      if (currentRequest === requestId.current) {

        setLoadingMetrics(false);

      }

    }

  };



  // Xác định cơ sở nhân viên thực sự được phân công và đồng bộ cache theo user

  useEffect(() => {

    let cancelled = false;

    staffFacilityService

      .getMyFacility()

      .then((info) => {

        if (cancelled || !info?.facilityId) return;

        setMyFacilityInfo(info);

        const assignedId = String(info.facilityId);

        setSelectedFacilityId((current) => {

          if (current !== assignedId) {

            localStorage.setItem(storageKey, assignedId);

            return assignedId;

          }

          return current;

        });

      })

      .catch((err) => {

        console.error("Failed to resolve staff's assigned facility:", err);

      });

    return () => {

      cancelled = true;

    };

  }, [user?.id, storageKey]);



  useEffect(() => {

    if (!selectedFacilityId) return;

    loadDashboardData(selectedFacilityId);

    return () => {

      requestId.current++;

    };

  }, [selectedFacilityId]);



  // Real-time synchronization via SignalR

  useEffect(() => {

    if (!recentEvent) return;

    const t = recentEvent.type;

    if (t === "ticket" || t === "task" || t === "notification" || t === "unit") {

      loadDashboardData(selectedFacilityId);

    }

  }, [recentEvent, selectedFacilityId]);



  useEffect(() => {

    const unsubTicket = subscribe("TicketUpdated", () => {

      loadDashboardData(selectedFacilityId);

    });

    const unsubTask = subscribe("TaskAssigned", () => {

      loadDashboardData(selectedFacilityId);

    });

    return () => {

      unsubTicket();

      unsubTask();

    };

  }, [subscribe, selectedFacilityId]);



  // Derived real KPI statistics

  const totalUnits = units.length;

  const vacantUnits = units.filter(

    (u) => u.status === STORAGE_UNIT_STATUS.AVAILABLE || u.status === "vacant"

  ).length;

  const occupiedUnits = units.filter(

    (u) => u.status === STORAGE_UNIT_STATUS.OCCUPIED || u.status === "rented"

  ).length;

  const pendingUnits = units.filter(

    (u) => u.status === STORAGE_UNIT_STATUS.RESERVED || u.status === "pending"

  ).length;

  const cleaningUnits = units.filter(

    (u) => u.status === STORAGE_UNIT_STATUS.CLEANING || u.status === "cleaning"

  ).length;

  const maintenanceUnits = units.filter(

    (u) => u.status === STORAGE_UNIT_STATUS.MAINTENANCE || u.status === "under_maintenance"

  ).length;

  const occupancyRate =

    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;



  // Khử trùng lặp nhiệm vụ: Mỗi TicketId / TicketNo chỉ hiển thị DUY NHẤT 1 bản ghi nhiệm vụ

  const dedupedTasks = useMemo(() => {

    const map = new Map();

    for (const task of tasks) {

      let key = `task_${task.id}`;

      if (task.ticketId) {

        key = `ticket_${task.ticketId}`;

      } else if (task.title && task.title.startsWith("[Sự cố #")) {

        const match = task.title.match(/\[Sự cố #([^\]]+)\]/);

        if (match) key = `ticket_${match[1]}`;
      } else if (task.title && task.title.includes("Nghiệm thu trả kho")) {
        const match = task.title.match(/HĐ #([^\]]+)\]/);
        if (match) key = `inspection_${match[1]}`;

      }



      if (!map.has(key)) {

        map.set(key, task);

      } else {

        const existing = map.get(key);

        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();

        const curTime = new Date(task.updatedAt || task.createdAt || 0).getTime();

        const existingDone = existing.status === "done" || existing.status === "completed";

        const curDone = task.status === "done" || task.status === "completed";

        if (curDone && !existingDone) {

          map.set(key, task);

        } else if (!existingDone && curTime > existingTime) {

          map.set(key, task);

        }

      }

    }

    return Array.from(map.values());

  }, [tasks]);



  const totalTasks = dedupedTasks.length;

  const completedTasks = dedupedTasks.filter(

    (t) => t.status === "completed" || t.status === "done"

  ).length;

  const pendingTasks = Math.max(0, totalTasks - completedTasks);



  const confirmedReservations = reservations.filter(
    (r) => r.status === RESERVATION_STATUS.CONFIRMED || r.status === RESERVATION_STATUS.PENDING
  ).length;

  const pendingMoveOutsCount = useMemo(() => {
    return moveOuts.filter(
      (m) => m.status !== "completed" && m.status !== "cancelled"
    ).length;
  }, [moveOuts]);



  // Bộ lọc: chỉ hiển thị Ticket do Manager phân công cho Staff đang đăng nhập (khử trùng lặp theo ticket.id)

  const myAssignedTickets = useMemo(() => {

    const uid = user?.id || user?.userId || user?.employeeId;

    const staffName = (user?.fullName || user?.name || "").trim().toLowerCase();

    const seen = new Set();

    const list = [];



    for (const t of supportTickets) {

      if (seen.has(t.id)) continue;

      let matched = false;

      if (t.isAssignedToMe) matched = true;

      else if (uid && (t.assignedEmployeeId === uid || t.assignedToId === uid || String(t.assignedEmployeeId) === String(uid))) matched = true;

      else if (user?.employeeId && (t.assignedEmployeeId === user.employeeId || String(t.assignedEmployeeId) === String(user.employeeId))) matched = true;

      else if (staffName && t.assignedEmployeeName && t.assignedEmployeeName.trim().toLowerCase() === staffName) matched = true;

      else if (!t.assignedEmployeeId) matched = true;



      if (matched) {

        seen.add(t.id);

        list.push(t);

      }

    }

    return list;

  }, [supportTickets, user]);



  const activeTickets = useMemo(() => {

    return myAssignedTickets.filter((t) =>

      t.status !== "resolved" && t.status !== "closed" && t.status !== "completed"

    );

  }, [myAssignedTickets]);



  const completedTickets = useMemo(() => {

    return myAssignedTickets.filter((t) =>

      t.status === "resolved" || t.status === "closed" || t.status === "completed"

    );

  }, [myAssignedTickets]);



  const openTickets = activeTickets;

  // Số đếm trên tab Sự cố hiển thị số lượng nhiệm vụ cần xử lý thực tế

  const openIssuesCount = pendingTasks;



  const staffFacility = useMemo(() => {

    if (myFacilityInfo?.facilityId) {

      return {

        id: myFacilityInfo.facilityId,

        facilityCode: myFacilityInfo.facilityCode,

        facilityName: myFacilityInfo.facilityName,

        address: myFacilityInfo.address || myFacilityInfo.city || "",

      };

    }

    const fId = dedupedTasks[0]?.facilityId || user?.facilityId || selectedFacilityId || 1;

    return (

      facilities.find((f) => String(f.id) === String(fId)) || {

        id: fId,

        facilityCode: `FAC-${fId}`,

        facilityName: `Facility #${fId}`,

        address: "Ho Chi Minh City",

      }

    );

  }, [myFacilityInfo, facilities, dedupedTasks, user, selectedFacilityId]);



  // Single unified task filters list (All, To Do, Done, Support, Inspection)

  const taskFilterItems = useMemo(() => {

    const isVi = lang === "vi";

    const items = [

      { id: "all", label: isVi ? "Tất cả" : "All Tasks", count: totalTasks },

      { id: "active", label: isVi ? "Cần làm" : "To Do", count: pendingTasks },

      { id: "done", label: isVi ? "Đã xong" : "Done", count: completedTasks },

    ];



    const distinctTypes = [...new Set(dedupedTasks.map((task) => task.taskType).filter(Boolean))];

    for (const type of distinctTypes) {

      items.push({

        id: type,

        label: getTaskTypeLabel(type, isVi),

        count: dedupedTasks.filter((task) => task.taskType === type).length,

      });

    }



    return items;

  }, [lang, totalTasks, pendingTasks, completedTasks, dedupedTasks]);



  const filteredTasks = useMemo(() => {

    if (taskFilter === "all") return dedupedTasks;

    if (taskFilter === "active") {

      return dedupedTasks.filter((task) => task.status !== "done" && task.status !== "completed");

    }

    if (taskFilter === "done") {

      return dedupedTasks.filter((task) => task.status === "done" || task.status === "completed");

    }

    return dedupedTasks.filter((task) => task.taskType === taskFilter);

  }, [dedupedTasks, taskFilter]);



  const handleUpdateTask = (updated) => {

    setTasks((current) =>

      current.map((task) => {

        if (task.id === updated.id) return updated;

        if (task.ticketId && updated.ticketId && task.ticketId === updated.ticketId) {

          return { ...task, status: updated.status, progressPercent: updated.progressPercent };
        }
        if (task.title && updated.title && task.title.includes("Nghiệm thu trả kho") && task.title === updated.title) {
          return { ...task, status: updated.status, progressPercent: updated.progressPercent };
        }

        return task;

      })

    );

    if (selectedFacilityId) {

      staffSupportService

        .getTickets({ facilityId: Number(selectedFacilityId) })

        .then((res) => {

          if (Array.isArray(res)) setSupportTickets(res);

        })

        .catch(() => {});

    }

  };



  return (

    <div className="relative min-h-screen bg-white dark:bg-zinc-950 dark:text-zinc-100 text-slate-900 font-sans flex flex-col antialiased">

      <PageBackground />



      {/* Shared Portal Header without Customer Links */}

      <Header active="ops" hideCustomerNav={true} />



      {/* Main Operations Container */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">



        {/* 4 Interactive Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {/* KPI 1: Check-in Queue -> Tab checkin */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("checkin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("staff.checkin_handover", "Check-in & Bàn giao")}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {t("staff.checkin_handover", "Check-in & Bàn giao")}
                </p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-zinc-900 dark:text-zinc-100 border border-blue-200 group-hover:bg-zinc-900 text-white group-hover:text-white transition-colors">
                  {t("common.scan_qr", "Quét QR")}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : String(confirmedReservations).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-blue-600">{t("status.pending", "Chờ nhận")}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-zinc-900 text-white text-zinc-900 dark:text-zinc-100 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          </button>

          {/* KPI 2: Shift Tasks -> Tab issues */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("issues");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("staff.tasks", "Nhiệm vụ trong ca")}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                {t("staff.tasks", "Nhiệm vụ trong ca")}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : String(pendingTasks).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {t("staff.todo_tickets", "cần làm")} / {totalTasks} {t("staff.tasks", "nhiệm vụ")}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-zinc-900 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </button>

          {/* KPI 3: Move-out Inspection -> Tab moveout */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("moveout");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("staff.moveout_tab", "Nghiệm thu trả kho")}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                {t("staff.moveout_tab", "Nghiệm thu trả kho")}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-blue-600 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : String(pendingMoveOutsCount).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {t("staff.pending_inspection", "chờ kiểm tra")}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-zinc-900 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </button>

          {/* KPI 4: Occupancy -> Tab units */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("units");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-zinc-900 dark:border-zinc-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-zinc-900/20 dark:ring-zinc-100/20"
            title={t("manager.occupancy_rate", "Tỷ lệ lấp đầy")}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                {t("manager.occupancy_rate", "Tỷ lệ lấp đầy")}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors">
                  {loadingMetrics ? "..." : `${occupancyRate}%`}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {vacantUnits} {t("status.available", "trống")}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-zinc-900 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </button>

        </div>

        {/* Center Grid: balanced workspace columns */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">



          {/* Left Column: Main Navigation Tabs & Operational Modules */}

          <div className="lg:col-span-6 space-y-5">



            {/* Main Tabs Container */}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                <button

                  type="button"

                  onClick={() => setActiveTab("checkin")}

                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${

                    activeTab === "checkin"

                      ? "bg-zinc-900 text-white text-white shadow-xs"

                      : "text-slate-600 hover:bg-slate-100"

                  }`}

                >

                  {t("staff.checkin_tab", "Check-in")}

                </button>



                <button

                  type="button"

                  onClick={() => setActiveTab("moveout")}

                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${

                    activeTab === "moveout"

                      ? "bg-zinc-900 text-white text-white shadow-xs"

                      : "text-slate-600 hover:bg-slate-100"

                  }`}

                >

                  {t("staff.moveout_tab", "Trả kho")}

                </button>



                <button

                  type="button"

                  onClick={() => setActiveTab("units")}

                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${

                    activeTab === "units"

                      ? "bg-zinc-900 text-white text-white shadow-xs"

                      : "text-slate-600 hover:bg-slate-100"

                  }`}

                >

                  {t("staff.units_tab", "Ô kho")}

                </button>



                {hasCapability(user, CAPABILITIES.SHIFT_VIEW) && (

                  <button

                    type="button"

                    onClick={() => setActiveTab("shifts")}

                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${

                      activeTab === "shifts"

                        ? "bg-zinc-900 text-white text-white shadow-xs"

                        : "text-slate-600 hover:bg-slate-100"

                    }`}

                  >

                    {t("staff.shifts_tab", "Ca trực")}

                  </button>

                )}



                <button

                  type="button"

                  onClick={() => setActiveTab("issues")}

                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${

                    activeTab === "issues"

                      ? "bg-zinc-900 text-white text-white shadow-xs"

                      : "text-slate-600 hover:bg-slate-100"

                  }`}

                >

                  {t("staff.issues_tab", "Sự cố")} ({openIssuesCount})

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



                {activeTab === "shifts" && (

                  <StaffShiftSchedule facilityId={selectedFacilityId} />

                )}



                {activeTab === "issues" && (

                  <div className="space-y-4">

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">

                        {t("staff.tasks", "Nhiệm vụ")}

                      </h3>

                      <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">

                        {taskFilterItems.map((item) => (

                          <button

                            key={item.id}

                            type="button"

                            onClick={() => setTaskFilter(item.id)}

                            className={`px-2.5 py-1 rounded transition cursor-pointer ${

                              taskFilter === item.id

                                ? "bg-white text-slate-900 shadow-xs"

                                : "text-slate-500 hover:text-slate-900"

                            }`}

                          >

                            {item.label} ({item.count})

                          </button>

                        ))}

                      </div>

                    </div>



                    {filteredTasks.length === 0 ? (

                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">

                        {t("common.no_data", "Không có dữ liệu")}

                      </div>

                    ) : (

                      filteredTasks.map((task) => {

                        const isDone = task.status === "done" || task.status === "completed";

                        const isSevere = task.status === "blocked";

                        const isInProgress = task.status === "in_progress";



                        return (

                          <div

                            key={task.id}

                            className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${

                              isDone

                                ? "border-emerald-200 bg-emerald-50/25"

                                : isSevere

                                ? "border-rose-200 bg-rose-50/25"

                                : "border-slate-200 bg-slate-50/60"

                            }`}

                          >

                            <div className="flex justify-between items-start gap-2">

                              <div>

                                <strong className="text-xs font-bold text-slate-900">

                                  {task.title || `Task #${task.id}`}

                                </strong>

                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">

                                  <span>{task.facilityCode || "HCM-TD"}</span>

                                  <span>•</span>

                                  {isDone ? (

                                    <span className="font-semibold text-emerald-700">✓ Đã khắc phục xong</span>

                                  ) : isSevere ? (

                                    <span className="font-semibold text-rose-600">⚠ Hư hỏng nặng - Đổi kho</span>

                                  ) : isInProgress ? (

                                    <span className="font-semibold text-blue-700">Đang kiểm tra / Xử lý</span>

                                  ) : (

                                    <span className="font-semibold text-amber-700">Chưa bắt đầu</span>

                                  )}

                                </div>

                              </div>

                              <span

                                className={`text-xs font-bold ${

                                  isDone

                                    ? "text-emerald-700"

                                    : isSevere

                                    ? "text-rose-600"

                                    : "text-zinc-900 dark:text-zinc-100"

                                }`}

                              >

                                {task.progressPercent ?? 0}%

                              </span>

                            </div>

                            <div>

                              <StaffTaskStatus task={task} onUpdated={handleUpdateTask} />

                            </div>

                          </div>

                        );

                      })

                    )}

                  </div>

                )}

              </div>

            </div>



            </div>

          {/* Right Column: Smart Floorplan & Staff Duty Facility Presence */}

          <div className="lg:col-span-6 space-y-5 lg:sticky lg:top-6 self-start" style={{ position: "sticky", top: "24px" }}>

            {/* Smart Floorplan Card */}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">

              <div className="flex items-center justify-between">

                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t("manager.units", "Quản lý ô kho & Mặt bằng")}</h2>

                <button

                  type="button"

                  onClick={() => setActiveTab("units")}

                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"

                >

                  {t("common.view", "Mở rộng")}

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

              <div className="grid grid-cols-5 gap-1.5 text-center">

                <div className="bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg">

                  <span className="block text-xs font-bold text-slate-900">

                    {loadingMetrics ? "..." : vacantUnits}

                  </span>

                  <span className="block text-[10px] text-emerald-700 font-medium">{t("status.available", "Trống")}</span>

                </div>

                <div className="bg-blue-50 border border-blue-100 py-1.5 rounded-lg">

                  <span className="block text-xs font-bold text-slate-900">

                    {loadingMetrics ? "..." : occupiedUnits}

                  </span>

                  <span className="block text-[10px] text-blue-700 font-medium">{t("status.occupied", "Đang thuê")}</span>

                </div>

                <div className="bg-amber-50 border border-amber-100 py-1.5 rounded-lg">

                  <span className="block text-xs font-bold text-slate-900">

                    {loadingMetrics ? "..." : pendingUnits}

                  </span>

                  <span className="block text-[10px] text-amber-700 font-medium">{t("status.reserved", "Giữ chỗ")}</span>

                </div>

                <div className="bg-purple-50 border border-purple-100 py-1.5 rounded-lg">

                  <span className="block text-xs font-bold text-slate-900">

                    {loadingMetrics ? "..." : cleaningUnits}

                  </span>

                  <span className="block text-[10px] text-purple-700 font-medium">{t("status.cleaning", "Vệ sinh")}</span>

                </div>

                <div className="bg-red-50 border border-red-100 py-1.5 rounded-lg">

                  <span className="block text-xs font-bold text-slate-900">

                    {loadingMetrics ? "..." : maintenanceUnits}

                  </span>

                  <span className="block text-[10px] text-red-700 font-medium">{t("status.maintenance", "Bảo trì")}</span>

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


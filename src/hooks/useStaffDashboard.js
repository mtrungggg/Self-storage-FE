import { useMemo, useState } from "react";
import {
  getStaffProfile,
  getFacilityStats,
  getTicketTabs,
  getAssignedTickets,
  getShiftSchedule,
} from "../data/staffDashboardRepository";
import { filterTicketsByStatus } from "../domain/usecases/filterSupportRecords";
import { calculateTicketStats } from "../domain/usecases/calculateTicketStats";

// Application layer: encapsulates Staff Dashboard state, filtering and data wiring.
export function useStaffDashboard() {
  const profile = getStaffProfile();
  const facilityStats = getFacilityStats();
  const ticketTabs = getTicketTabs();
  const tickets = getAssignedTickets();
  const shiftSchedule = getShiftSchedule();

  const [activeTicketTab, setActiveTicketTab] = useState("all");

  const filteredTickets = useMemo(
    () => filterTicketsByStatus(tickets, activeTicketTab),
    [tickets, activeTicketTab]
  );
  const ticketStats = useMemo(() => calculateTicketStats(tickets), [tickets]);

  return {
    profile,
    facilityStats,
    ticketTabs,
    shiftSchedule,
    activeTicketTab,
    setActiveTicketTab,
    filteredTickets,
    ticketStats,
  };
}

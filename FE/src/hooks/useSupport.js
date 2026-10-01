import { useMemo, useState } from "react";
import {
  getUnitTabs,
  getSupportUnits,
  getTicketTabs,
  getSupportTickets,
} from "../data/supportRepository";
import { filterUnitsByStatus, filterTicketsByStatus } from "../domain/usecases/filterSupportRecords";

// Application layer: encapsulates Support page state, filtering and data wiring.
export function useSupport() {
  const unitTabs = getUnitTabs();
  const units = getSupportUnits();
  const ticketTabs = getTicketTabs();
  const tickets = getSupportTickets();

  const [activeUnitTab, setActiveUnitTab] = useState("all");
  const [activeTicketTab, setActiveTicketTab] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [allowMasterKey, setAllowMasterKey] = useState(false);

  const filteredUnits = useMemo(() => filterUnitsByStatus(units, activeUnitTab), [units, activeUnitTab]);
  const filteredTickets = useMemo(
    () => filterTicketsByStatus(tickets, activeTicketTab),
    [tickets, activeTicketTab]
  );

  return {
    unitTabs,
    ticketTabs,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    priority,
    setPriority,
    allowMasterKey,
    setAllowMasterKey,
    filteredUnits,
    filteredTickets,
  };
}

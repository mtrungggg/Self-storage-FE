import { useEffect, useMemo, useState } from "react";
import rentalService from "../api/rentalService";
import { formatVnd } from "../lib/utils";

const TICKET_STORAGE_KEY = "vaultspace_support_tickets";

// Application layer: encapsulates Support page state, filtering and data wiring.
export function useSupport() {
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [facilityNameState, setFacilityNameState] = useState("");

  // Local storage persisted tickets so user submissions actually appear in real-time
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(TICKET_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    rentalService
      .getMyRentals()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const activeList = list.filter((r) => (r.status || "").toLowerCase() !== "ended");
        setActiveRentals(activeList);
        if (activeList.length > 0 && activeList[0].facilityName) {
          setFacilityNameState(activeList[0].facilityName);
        }
      })
      .catch((err) => {
        console.warn("Failed to load customer rentals for Support page:", err);
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Map real rental data into Support view models (English)
  const units = useMemo(() => {
    return activeRentals.map((r) => ({
      id: r.unitCode,
      agreementId: r.agreementId,
      location: `Floor ${r.floorLabel || "1"} • Zone ${r.zoneLabel || "A"} • ${r.facilityName || "Storage Facility"}`,
      status: "active",
      statusLabel: "Active",
      size: `${r.areaM2 || "3.0"} m² (${r.dimensions || "Standard"})`,
      sizeNote: r.unitTypeName || "Standard Self-Storage",
      climate: "20° – 22°C • Digital Lock",
      contractLabel: "Contract Term",
      contractDate: `Agreement #${r.agreementNo || "AGR-2026"}`,
      contractLeft: r.endDate ? `Valid until ${new Date(r.endDate).toLocaleDateString("en-US")}` : "Active Term",
      payment: `${formatVnd(r.monthlyRate)}/month • Auto-Pay`,
      primaryAction: "View PIN / Keypad Access",
      footerLinks: ["Report Issue", "Renew Lease"],
    }));
  }, [activeRentals]);

  const unitTabs = useMemo(() => [
    { id: "all", label: `All Units (${units.length})` },
    { id: "active", label: `Active (${units.length})` },
    { id: "renew", label: "Needs Renewal (0)" },
  ], [units]);

  const [activeUnitTab, setActiveUnitTab] = useState("all");
  const [activeTicketTab, setActiveTicketTab] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [allowMasterKey, setAllowMasterKey] = useState(false);
  const [selectedUnitCode, setSelectedUnitCode] = useState("");
  const [category, setCategory] = useState("PIN Code error / Digital Keypad not responding");
  const [description, setDescription] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Set default selected unit when units load
  useEffect(() => {
    if (units.length > 0 && !selectedUnitCode) {
      setSelectedUnitCode(units[0].id);
    }
  }, [units, selectedUnitCode]);

  const ticketTabs = useMemo(() => {
    const pendingCount = tickets.filter((t) => t.status === "pending").length;
    const assignedCount = tickets.filter((t) => t.status === "assigned").length;
    const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
    return [
      { id: "all", label: `All (${tickets.length})` },
      { id: "pending", label: `Pending (${pendingCount})` },
      { id: "assigned", label: `Assigned (${assignedCount})` },
      { id: "resolved", label: `Resolved (${resolvedCount})` },
    ];
  }, [tickets]);

  const filteredUnits = useMemo(() => {
    if (activeUnitTab === "all") return units;
    return units.filter((u) => u.status === activeUnitTab);
  }, [units, activeUnitTab]);

  const filteredTickets = useMemo(() => {
    if (activeTicketTab === "all") return tickets;
    return tickets.filter((t) => t.status === activeTicketTab);
  }, [tickets, activeTicketTab]);

  const primaryRental = activeRentals[0] || null;
  const facilityName = facilityNameState || primaryRental?.facilityName || "Thu Duc Self Storage";

  const addTicket = ({ unitCode, requestType, priorityLevel, issueDesc }) => {
    const newId = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newId,
      status: "pending",
      statusLabel: "Pending Review",
      title: `${requestType} on unit #${unitCode || "Primary"}`,
      unit: `Unit: #${unitCode || "General"}`,
      time: "Reported: Just now",
      quote: issueDesc || "Customer submitted technical support request.",
      footer: "Dispatch: Assigning on-duty facility technician",
      eta: priorityLevel === "urgent" ? "Est. response: Within 15 mins" : "Est. response: Within 2-4 hours",
    };

    const nextTickets = [newTicket, ...tickets];
    setTickets(nextTickets);
    try {
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(nextTickets));
    } catch {
      // ignore
    }
    setSubmitSuccess(true);
    setDescription("");
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

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
    facilityName,
    activeRentals,
    rentalsLoading,
    selectedUnitCode,
    setSelectedUnitCode,
    category,
    setCategory,
    description,
    setDescription,
    submitSuccess,
    addTicket,
    tickets,
  };
}

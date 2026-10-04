import { useEffect, useMemo, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import { SUPPORT_CATEGORIES } from "../data/supportCategories";

import supportService from "../api/supportService";

function toTicketView(ticket) {
  const status = (ticket.status || ticket.displayStatus || "pending").toLowerCase().replace(/[ _-]/g, "");
  return {
    id: ticket.id,
    ticketNo: ticket.ticketNo || String(ticket.id),
    status: ["open", "new", "pendingreview"].includes(status) ? "pending" : status === "inprogress" ? "assigned" : status,
    statusLabel: ticket.displayStatus || ticket.status || "Pending",
    title: ticket.subject,
    unit: ticket.facilityName,
    time: "Reported: " + new Date(ticket.createdAt).toLocaleString("en-US"),
    footer: "Priority: " + (ticket.priority || "Normal"),
  };
}

// Application layer: encapsulates Support page state, filtering and data wiring.
export function useSupport() {
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [facilityNameState, setFacilityNameState] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    supportService.getTickets()
      .then((data) => { if (active) setTickets(data.map(toTicketView)); })
      .catch((error) => { if (active) setTicketsError(error.message || "Unable to load tickets."); })
      .finally(() => { if (active) setTicketsLoading(false); });
    return () => { active = false; };
  }, []);

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
        if (active) setSubmitError(err.message || "Unable to load your rentals.");
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
      id: String(r.agreementId),
      unitCode: r.unitCode,
      status: "active",
      statusLabel: "Active",
      contractDate: `Agreement #${r.agreementNo || "AGR-2026"}`,
      contractLeft: r.endDate ? `Valid until ${new Date(r.endDate).toLocaleDateString("en-US")}` : "Active Term",
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
  const [category, setCategory] = useState("access");
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

  const addTicket = async () => {
    if (submitLock.current) return;
    setSubmitSuccess(false);
    setSubmitError("");
    const rental = activeRentals.find((r) => String(r.agreementId) === selectedUnitCode);
    if (!rental?.facilityId) {
      setSubmitError("Please select an active rental before submitting a request.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Please describe the issue.");
      return;
    }
    const selectedCategory = SUPPORT_CATEGORIES.find((item) => item.value === category);
    if (!selectedCategory) {
      setSubmitError("Please select a valid issue category.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    try {
      const ticket = await supportService.createTicket({
        facilityId: rental.facilityId,
        agreementId: rental.agreementId,
        storageUnitId: rental.storageUnitId,
        category,
        priority: priority === "urgent" ? "urgent" : "normal",
        subject: selectedCategory.label + " on unit #" + rental.unitCode,
        description: description.trim() + (allowMasterKey ? "\n\nCustomer allows master key access while away." : ""),
        attachments: [],
      });
      setTickets((current) => [toTicketView(ticket), ...current]);
      setActiveTicketTab("all");
      setSubmitSuccess(true);
      setDescription("");
      setAllowMasterKey(false);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit the request. Please try again.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
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
    submitError,
    submitting,
    ticketsLoading,
    ticketsError,
    addTicket,
    tickets,
    updateTicket: (ticket) => setTickets((current) => current.map((item) => item.id === ticket.id ? toTicketView(ticket) : item)),
  };
}

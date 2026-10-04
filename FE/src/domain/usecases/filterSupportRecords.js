// Pure filtering rules for the Support page (domain layer).
export function normalizeTicketStage(ticket) {
  const status = (ticket?.status || "").toLowerCase();
  const display = (ticket?.displayStatus || "").toLowerCase();

  if (display === "reported" || status === "open" || status === "pending") {
    return "Reported";
  }
  if (
    display === "investigating" ||
    display.includes("waiting") ||
    status === "in_progress" ||
    status === "waiting_for_customer" ||
    status === "waiting_for_maintenance" ||
    status === "assigned"
  ) {
    return "Investigating";
  }
  if (display === "assessed" || status === "assessed") {
    return "Assessed";
  }
  if (display === "resolved" || status === "resolved") {
    return "Resolved";
  }
  if (display === "closed" || status === "closed") {
    return "Closed";
  }
  if (display === "cancelled" || status === "cancelled") {
    return "Cancelled";
  }
  return ticket?.displayStatus || "Reported";
}

export function filterUnitsByStatus(units, tab) {
  return units.filter((unit) => tab === "all" || unit.status === tab);
}

export function filterTicketsByStatus(tickets, tab) {
  if (!tab || tab === "all") return tickets;
  return tickets.filter((ticket) => {
    const stage = normalizeTicketStage(ticket);
    return (
      stage.toLowerCase() === tab.toLowerCase() ||
      (ticket.status || "").toLowerCase() === tab.toLowerCase() ||
      (ticket.displayStatus || "").toLowerCase() === tab.toLowerCase()
    );
  });
}

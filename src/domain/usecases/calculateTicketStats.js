// Aggregates ticket counts per status for the staff dashboard summary cards.
export function calculateTicketStats(tickets) {
  return {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };
}

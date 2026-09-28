// Pure filtering rules for the Support page (domain layer).
export function filterUnitsByStatus(units, tab) {
  return units.filter((unit) => tab === "all" || unit.status === tab);
}

export function filterTicketsByStatus(tickets, tab) {
  return tickets.filter((ticket) => tab === "all" || ticket.status === tab);
}

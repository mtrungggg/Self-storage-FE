// Data layer: content source for the Support page.
export function getUnitTabs() {
  return [
    { id: "all", label: "All Units" },
    { id: "active", label: "Active" },
    { id: "renew", label: "Needs Renewal" },
  ];
}

export function getSupportUnits() {
  return [];
}

export function getTicketTabs() {
  return [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "assigned", label: "Assigned" },
    { id: "resolved", label: "Resolved" },
  ];
}

export function getSupportTickets() {
  return [];
}

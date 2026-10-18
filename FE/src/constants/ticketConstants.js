/**
 * Canonical ticket constants aligned with Backend TicketConstants domain invariants.
 */

export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  WAITING_FOR_CUSTOMER: "waiting_for_customer",
  WAITING_FOR_MAINTENANCE: "waiting_for_maintenance",
  ASSESSED: "assessed",
  RESOLVED: "resolved",
  CLOSED: "closed",
  CANCELLED: "cancelled",
  // UI normalized aliases
  PENDING: "pending",
  ASSIGNED: "assigned",
};

export const TICKET_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

export const TICKET_CATEGORY = {
  UNIT: "unit",
  ACCESS: "access",
  PAYMENT: "payment",
  STORED_ITEM: "stored_item",
  MAINTENANCE: "maintenance",
  OTHER: "other",
};

export const TICKET_STATUS_LIST = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
];

/**
 * Canonical rental & unit lifecycle constants aligned with Backend Domain & Database invariants.
 */

export const STORAGE_UNIT_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
  PENDING_INSPECTION: "pending_inspection",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
  // Legacy aliases
  VACANT: "available",
  RENTED: "occupied",
  UNDER_MAINTENANCE: "maintenance",
};

export const RESERVATION_STATUS = {
  PENDING: "pending",
  AWAITING_DEPOSIT: "awaiting_deposit",
  CONFIRMED: "confirmed",
  CONVERTED: "converted",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const RENTAL_AGREEMENT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  EXPIRING_SOON: "expiring_soon",
  TERMINATED: "terminated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const MOVE_OUT_STATUS = {
  REQUESTED: "requested",
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  INSPECTION_PENDING: "inspection_pending",
  SETTLEMENT_PENDING: "settlement_pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TRANSFER_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

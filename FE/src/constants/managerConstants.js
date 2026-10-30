/**
 * Constants strictly aligned with database CHECK constraints & BE domain constants.
 * Fully localized in English for the unified Manager Portal.
 */

export const DUTY_ROLES = [
  { value: "staff", label: "Operations Staff (staff)" },
  { value: "shift_lead", label: "Shift Lead (shift_lead)" },
  { value: "manager_on_call", label: "Manager on Call (manager_on_call)" },
];

export const STAFF_TASK_TYPES = [
  { value: "other", label: "General Tasks / Other" },
  { value: "maintenance", label: "Unit Maintenance" },
  { value: "inspection", label: "Facility Inspection" },
  { value: "support", label: "Customer Support" },
  { value: "check_in", label: "Check-in Procedure" },
  { value: "check_out", label: "Check-out Procedure" },
];

export const STAFF_TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Completed" },
];

export const UNIT_PHYSICAL_STATUS_OPTIONS = [
  ["available", "Available"],
  ["cleaning", "Cleaning"],
  ["pending_inspection", "Pending Inspection"],
  ["maintenance", "Maintenance"],
  ["out_of_service", "Out of Service"],
  ["occupied", "Occupied"],
  ["reserved", "Reserved"],
];

export const DELINQUENT_ACTION_TYPES = [
  ["reminder_sent", "Payment Reminder Sent"],
  ["customer_contacted", "Customer Contacted"],
  ["late_fee_added", "Late Fee Added"],
  ["credential_suspended", "Access Credential Suspended"],
  ["payment_plan", "Payment Plan Arranged"],
  ["waived", "Debt Waived"],
  ["termination_started", "Contract Termination Started"],
  ["note", "Internal Follow-up Note"],
];

export const DELINQUENT_CASE_STATUSES = [
  ["grace", "Grace Period"],
  ["delinquent", "Delinquent"],
  ["cured", "Cured / Settled"],
  ["waived", "Waived"],
  ["termination_started", "Termination Started"],
];

export const DECISION_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
};

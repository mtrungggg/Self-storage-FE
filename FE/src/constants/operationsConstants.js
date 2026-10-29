/**
 * Constants strictly aligned with database CHECK constraints & Operations BE domain constants.
 * Fully localized in English for the unified Manager Portal.
 */

export const FEE_TYPES = [
  { value: "late_payment", label: "Late Payment Fee (late_payment)" },
  { value: "damage", label: "Damage Compensation Fee (damage)" },
  { value: "key_lost", label: "Lost Key / Card Fee (key_lost)" },
  { value: "cleaning", label: "Unit Cleaning Fee (cleaning)" },
  { value: "administrative", label: "Administrative Fee (administrative)" },
  { value: "overstay", label: "Overstay Surcharge (overstay)" },
  { value: "other", label: "Other Ancillary Fee (other)" },
];

export const FEE_CALCULATION_METHODS = [
  { value: "flat", label: "Fixed Amount (flat)" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "per_day", label: "Daily Rate (per_day)" },
];

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage Discount (%)" },
  { value: "fixed", label: "Fixed Amount Discount (VND)" },
  { value: "free_days", label: "Free Rental Days" },
];

export const FACILITY_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "inactive", label: "Temporarily Inactive" },
];

export const PROMOTION_RULE_TYPES = {
  FACILITY: "facility",
  UNIT_TYPE: "unit_type",
  MIN_MONTHS: "min_months",
};

export const PROMOTION_OPERATORS = {
  EQUAL: "eq",
  GREATER_THAN_OR_EQUAL: "gte",
  LESS_THAN_OR_EQUAL: "lte",
  IN: "in",
};

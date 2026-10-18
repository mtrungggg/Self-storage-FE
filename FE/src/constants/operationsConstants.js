/**
 * Constants strictly aligned with database CHECK constraints & Operations BE domain constants.
 * DB Constraints:
 * - fee_type IN ('late_payment', 'damage', 'key_lost', 'cleaning', 'administrative', 'overstay', 'other')
 * - calculation_method IN ('flat', 'percentage', 'per_day')
 * - discount_type IN ('fixed', 'percentage', 'free_days')
 * - status IN ('draft', 'active', 'temporarily_closed', 'closed') or ('active', 'inactive', 'maintenance')
 */

export const FEE_TYPES = [
  { value: "late_payment", label: "Phí trễ hạn thanh toán (late_payment)" },
  { value: "damage", label: "Phí bồi thường hư hỏng (damage)" },
  { value: "key_lost", label: "Phí mất thẻ / chìa khóa (key_lost)" },
  { value: "cleaning", label: "Phí vệ sinh kho (cleaning)" },
  { value: "administrative", label: "Phí hành chính (administrative)" },
  { value: "overstay", label: "Phí lưu kho quá hạn (overstay)" },
  { value: "other", label: "Phụ phí khác (other)" },
];

export const FEE_CALCULATION_METHODS = [
  { value: "flat", label: "Số tiền cố định (flat)" },
  { value: "percentage", label: "Tỷ lệ phần trăm (percentage)" },
  { value: "per_day", label: "Theo ngày phát sinh (per_day)" },
];

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Giảm theo phần trăm (%)" },
  { value: "fixed", label: "Giảm số tiền cố định (VNĐ)" },
  { value: "free_days", label: "Tặng ngày thuê miễn phí" },
];

export const FACILITY_STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động (active)" },
  { value: "maintenance", label: "Bảo trì / Sửa chữa (maintenance)" },
  { value: "inactive", label: "Tạm ngừng hoạt động (inactive)" },
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

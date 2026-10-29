/**
 * Centralized Business Thresholds and Domain Policies.
 * Decouples mutable business policies and calculations from UI components.
 */

export const BUSINESS_CONFIG = Object.freeze({
  // Reservation & Hold Policies
  RESERVATION: Object.freeze({
    HOLD_TIMEOUT_SECONDS: 15 * 60, // 15-minute temporary reservation hold window
    HOLD_TIMEOUT_MINUTES: 15,
  }),

  // Operations & Workload
  WORKLOAD: Object.freeze({
    STANDARD_SHIFT_HOURS_PER_WEEK: 40,
  }),

  // Storage Unit Sizing (m²)
  UNIT_SIZING: Object.freeze({
    MINI_MAX_AREA_M2: 1.5,
    SMALL_MAX_AREA_M2: 4.0,
    MEDIUM_MAX_AREA_M2: 8.0,
    LARGE_MAX_AREA_M2: 12.0,
  }),

  // Media & File Upload Constraints
  UPLOAD: Object.freeze({
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }),
});

export default BUSINESS_CONFIG;

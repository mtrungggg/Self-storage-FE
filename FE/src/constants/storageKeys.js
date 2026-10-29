/**
 * Centralized Storage Keys for sessionStorage and localStorage.
 * Eliminates magic string duplication across auth, contexts, and access control.
 */

export const STORAGE_KEYS = Object.freeze({
  // Authentication & Session
  ACCESS_TOKEN: "accessToken",
  CURRENT_USER: "currentUser",
  REMEMBERED_EMAIL: "rememberedEmail",

  // Facility & Management
  MANAGER_ACTIVE_FACILITY_ID: "managerActiveFacilityId",
  FACILITY_CHECKINS: "g1_facility_checkins",
  ADMIN_CRUD_CACHE: "g1_admin_crud_v1",

  // Keypad PIN prefix generator
  PIN_PREFIX: "g1_pin_",
  getPinKey: (rentalId) => `g1_pin_${rentalId}`,
});

export default STORAGE_KEYS;

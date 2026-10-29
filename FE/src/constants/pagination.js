/**
 * Centralized Pagination Thresholds and Limit Options.
 * Eliminates magic number page sizes across Admin, Manager, and Service modules.
 */

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE_SIZE: 10,
  TABLE_PAGE_SIZE: 20,
  BATCH_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
});

export default PAGINATION;

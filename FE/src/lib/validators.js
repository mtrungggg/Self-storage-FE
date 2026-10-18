/**
 * Reusable validation helpers eliminating duplicated regex and validation bugs.
 */

export const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/;

export function isValidPositiveInteger(value) {
  if (value == null) return false;
  const str = String(value).trim();
  return POSITIVE_INTEGER_REGEX.test(str);
}

export function isValidDateRange(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return true;
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  return !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && to >= from;
}

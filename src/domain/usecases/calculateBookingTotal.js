// Pure pricing rules for a storage unit booking (domain layer).
export const BASE_RENT = 89;
export const DEPOSIT = 30;
export const SMART_LOCK_ACTIVATION = 15;
export const FIRST_MONTH_DISCOUNT = BASE_RENT * 0.5;

export function calculateAddonsTotal(addons) {
  return (addons.blankets ? 15 : 0) + (addons.boxKit ? 28 : 0);
}

export function calculateBookingTotal({ protectionPrice, addons }) {
  const addonsTotal = calculateAddonsTotal(addons);
  const totalToday =
    BASE_RENT - FIRST_MONTH_DISCOUNT + DEPOSIT + SMART_LOCK_ACTIVATION + protectionPrice + addonsTotal;
  const monthlyRent = BASE_RENT + protectionPrice;
  return { totalToday, monthlyRent, addonsTotal };
}

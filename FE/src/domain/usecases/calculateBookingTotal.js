// Pure pricing rules for optional add-ons on a storage unit booking (domain layer).
// Core rent/deposit/discount figures come from the backend pricing engine (see pricingService).
export function calculateAddonsTotal(addons) {
  return (addons?.blankets ? 360000 : 0) + (addons?.boxKit ? 672000 : 0);
}


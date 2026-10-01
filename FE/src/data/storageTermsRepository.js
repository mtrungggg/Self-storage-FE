// No fallback prices, fees or policies. Preserve API fields, including audit metadata.
export function getStorageTermsData(records = {}) {
  return {
    facility_rates: records?.facility_rates ?? [],
    price_ranges: records?.price_ranges ?? [],
    promotions: records?.promotions ?? [],
    promotion_rules: records?.promotion_rules ?? [],
    fee_rules: records?.fee_rules ?? [],
    policy_versions: records?.policy_versions ?? [],
  };
}

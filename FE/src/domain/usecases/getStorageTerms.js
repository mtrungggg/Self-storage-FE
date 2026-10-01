// Inclusive validity dates; null end is open-ended. Confirm convention with the API.
export function isEffective(record, date) {
  return Boolean(record.valid_from && record.valid_from <= date && (!record.valid_to || date <= record.valid_to));
}

export function getStorageTerms(data, unit, date) {
  const rates = data.facility_rates.filter((rate) => rate.facility_id === unit.facility_id && rate.unit_type_id === unit.unit_type_id && isEffective(rate, date));
  const policies = data.policy_versions.filter((policy) => isEffective(policy, date));
  const ranges = (data.price_ranges ?? []).filter((range) => range.unit_type_id === unit.unit_type_id && isEffective(range, date));
  const range = ranges.length === 1 ? ranges[0] : null;
  const validAmount = (value) => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
  const rangeInvalid = Boolean(range && (!validAmount(range.min_monthly_rate) || !validAmount(range.max_monthly_rate) || Number(range.min_monthly_rate) > Number(range.max_monthly_rate)));
  return {
    priceRange: rangeInvalid ? null : range,
    rangeConflict: ranges.length > 1,
    rangeInvalid,
    rate: rates.length === 1 ? rates[0] : null,
    rateConflict: rates.length > 1,
    fees: data.fee_rules.filter((fee) => fee.facility_id === unit.facility_id && fee.is_active && isEffective(fee, date)),
    policies,
    policyConflict: new Set(policies.map((policy) => policy.policy_type)).size !== policies.length,
  };
}

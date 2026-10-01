// Demo convention: inclusive dates. Overlapping versions are flagged, never silently selected.
export function isEffective(record, date) {
  return Boolean(record.valid_from && record.valid_from <= date && (!record.valid_to || date <= record.valid_to));
}

export function getStorageTerms(data, unit, date) {
  const rates = data.facility_rates.filter((rate) => rate.facility_id === unit.facility_id && rate.unit_type_id === unit.unit_type_id && isEffective(rate, date));
  const policies = data.policy_versions.filter((policy) => isEffective(policy, date));
  return {
    rate: rates.length === 1 ? rates[0] : null,
    rateConflict: rates.length > 1,
    fees: data.fee_rules.filter((fee) => fee.facility_id === unit.facility_id && fee.is_active && isEffective(fee, date)),
    policies,
    policyConflict: new Set(policies.map((policy) => policy.policy_type)).size !== policies.length,
  };
}

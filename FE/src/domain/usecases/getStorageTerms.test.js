import test from 'node:test';
import assert from 'node:assert/strict';
import { getStorageTerms, isEffective } from './getStorageTerms.js';
import { getStorageTermsData } from '../../data/storageTermsRepository.js';

const unit = { facility_id: 'f1', unit_type_id: 't2' };
test('matches both facility and unit type and filters inactive fees', () => {
  const data = getStorageTermsData();
  data.fee_rules[0].is_active = false;
  const result = getStorageTerms(data, unit, '2026-10-01');
  assert.equal(result.rate.id, 'r2');
  assert.deepEqual(result.fees.map((fee) => fee.id), ['fee2']);
  assert.equal(result.policies.length, 3);
});
test('validity is inclusive with open-ended support', () => {
  const record = { valid_from: '2026-01-01', valid_to: '2026-10-01' };
  assert.equal(isEffective(record, '2026-01-01'), true);
  assert.equal(isEffective(record, '2026-10-01'), true);
  assert.equal(isEffective(record, '2026-10-02'), false);
  assert.equal(isEffective(record, '2025-12-31'), false);
  assert.equal(isEffective({ ...record, valid_to: null }, '2030-01-01'), true);
});
test('missing or expired terms do not invent prices or policies', () => {
  const result = getStorageTerms(getStorageTermsData(), unit, '2025-01-01');
  assert.equal(result.rate, null);
  assert.equal(result.rateConflict, false);
  assert.deepEqual(result.fees, []);
  assert.deepEqual(result.policies, []);
});
test('overlapping prices and policy versions are explicitly flagged', () => {
  const data = getStorageTermsData();
  data.facility_rates.push({ ...data.facility_rates[1], id: 'duplicate' });
  data.policy_versions.push({ ...data.policy_versions[0], id: 'new-version', version: '2.0' });
  const result = getStorageTerms(data, unit, '2026-10-01');
  assert.equal(result.rate, null);
  assert.equal(result.rateConflict, true);
  assert.equal(result.policyConflict, true);
});

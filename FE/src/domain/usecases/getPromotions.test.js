import test from 'node:test';
import assert from 'node:assert/strict';
import { getPromotions } from './getPromotions.js';
import { getStorageTermsData } from '../../data/storageTermsRepository.js';

test('does not create fallback promotions', () => {
  assert.deepEqual(getPromotions(getStorageTermsData(), '2026-10-01'), []);
});
test('filters inactive and out-of-date promotions and links only their rules', () => {
  const base = { id: 1, is_active: true, valid_from: '2026-10-01', valid_to: '2026-10-31' };
  const data = { promotions: [base, { ...base, id: 2, is_active: false }, { ...base, id: 3, valid_to: '2026-09-30' }, { ...base, id: 4, valid_from: '2026-11-01' }], promotion_rules: [{ id: 'a', promotion_id: '1', rule_type: 'unknown', operator: 'unknown', rule_value: 'raw' }, { id: 'b', promotion_id: 2 }] };
  const result = getPromotions(data, '2026-10-01');
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].rules, [data.promotion_rules[0]]);
  assert.equal(getPromotions(data, '2026-10-31').length, 1);
  assert.equal(base.rules, undefined);
});
test('missing rules do not imply eligibility or unlimited use', () => {
  const result = getPromotions({ promotions: [{ id: 1, is_active: 1, valid_from: '2026-01-01', valid_to: null, usage_limit: 0 }] }, '2026-10-01');
  assert.deepEqual(result[0].rules, []);
  assert.equal(result[0].usage_limit, 0);
  assert.equal(result[0].eligible, undefined);
});

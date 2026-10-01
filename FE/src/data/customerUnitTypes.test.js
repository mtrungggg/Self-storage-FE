import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCustomerUnitTypes } from './customerUnitTypes.js';
test('maps measurements and preserves false climate control without inventing price or status', () => {
  const [type] = parseCustomerUnitTypes({ success: true, data: [{ id: 2, name: 'M', widthM: 2, lengthM: 3, heightM: 2.5, areaM2: 6, volumeM3: 15, maxWeightKg: 1200, climateControlled: false }] });
  assert.equal(type.area_m2, 6);
  assert.equal(type.max_weight_kg, 1200);
  assert.equal(type.climate_controlled, false);
  assert.equal(type.is_active, undefined);
  assert.equal(type.monthly_rate, undefined);
});
test('handles empty and failed responses', () => {
  assert.deepEqual(parseCustomerUnitTypes({ success: true, data: [] }), []);
  for (const payload of [null, { success: false, data: [] }, { success: true, data: [null] }]) assert.throws(() => parseCustomerUnitTypes(payload));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getStorageSearchData } from '../../../tests/fixtures/storageSearch.js';
import { searchStorageUnits, validateStorageSearch } from './searchStorageUnits.js';

const filters = { location: '', unitTypeId: '', minArea: '', maxArea: '', startDate: '', endDate: '', climateControlled: false };

test('combines accent-insensitive location, type, area and climate filters', () => {
  const results = searchStorageUnits(getStorageSearchData(), { ...filters, location: '  BINH thanh dien bien  ', unitTypeId: 't2', minArea: '10', maxArea: '10', climateControlled: true });
  assert.deepEqual(results.map((unit) => unit.id), ['u2']);
  assert.equal(results[0].area.name, 'Tầng trệt • Dãy A');
});

test('excludes rented, maintenance, unlisted and inactive records', () => {
  const data = getStorageSearchData();
  assert.equal(searchStorageUnits(data, filters).length, 4);
  data.facilities[0].status = 'Inactive';
  assert.deepEqual(searchStorageUnits(data, filters).map((unit) => unit.id), ['u3', 'u4']);
  data.unit_types[1].is_active = false;
  assert.deepEqual(searchStorageUnits(data, filters).map((unit) => unit.id), ['u4']);
  data.facility_areas[1].is_active = false;
  assert.equal(searchStorageUnits(data, filters).length, 0);
});

test('unmatched locations and conflicting criteria produce no results', () => {
  assert.deepEqual(searchStorageUnits(getStorageSearchData(), { ...filters, location: 'Da Nang' }), []);
  assert.deepEqual(searchStorageUnits(getStorageSearchData(), { ...filters, unitTypeId: 't1', minArea: '5' }), []);
});

test('validates area bounds and complete chronological rental ranges', () => {
  for (const changes of [{ minArea: '-1' }, { minArea: 'abc' }, { minArea: '20', maxArea: '4' }, { startDate: '2026-10-10' }, { startDate: '2026-10-10', endDate: '2026-10-10' }, { startDate: '2026-10-10', endDate: '2026-10-09' }]) {
    assert.notEqual(validateStorageSearch({ ...filters, ...changes }), '');
  }
  assert.equal(validateStorageSearch({ ...filters, minArea: '0', maxArea: '10', startDate: '2026-10-10', endDate: '2026-11-10' }), '');
});

test('rental dates do not fabricate availability without reservation data', () => {
  const data = getStorageSearchData();
  assert.deepEqual(searchStorageUnits(data, { ...filters, startDate: '2026-10-10', endDate: '2026-11-10' }), searchStorageUnits(data, filters));
});


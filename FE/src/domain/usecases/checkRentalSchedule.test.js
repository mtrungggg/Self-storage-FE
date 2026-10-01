import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRentalSchedule, overlapsRentalPeriod } from './checkRentalSchedule.js';

test('compares overlapping, adjacent and open-ended dates', () => {
  assert.equal(overlapsRentalPeriod({ start_date: '2026-10-01', end_date: '2026-10-10' }, '2026-10-10', '2026-10-20'), false);
  assert.equal(overlapsRentalPeriod({ start_date: '2026-10-01', end_date: null }, '2026-10-10', '2026-10-20'), true);
  assert.equal(overlapsRentalPeriod({ start_date: '2026-10-20', end_date: '2026-11-01' }, '2026-10-10', '2026-10-20'), false);
  assert.equal(overlapsRentalPeriod({}, '2026-10-10', '2026-10-20'), null);
});
test('resolves agreement type through reservation and preserves unresolved agreements', () => {
  const dates = { start_date: '2026-10-01', end_date: '2026-11-01' };
  const data = {
    reservations: [{ ...dates, id: 1, facility_id: 'f1', unit_type_id: 't1' }, { ...dates, id: 2, facility_id: 'f1', unit_type_id: 't2' }],
    rental_agreements: [{ ...dates, facility_id: 'f1', reservation_id: '1' }, { ...dates, facility_id: 'f1', reservation_id: 2 }, { ...dates, facility_id: 'f1', reservation_id: null }, { ...dates, facility_id: 'f2', reservation_id: null }],
  };
  assert.deepEqual(checkRentalSchedule(data, { facility_id: 'f1', unit_type_id: 't1' }, '2026-10-10', '2026-10-20'), { state: 'unverified', reservations: 1, agreements: 2, incompleteDates: 0 });
});
test('empty records never imply confirmed availability', () => {
  assert.equal(checkRentalSchedule({}, {}, '2026-10-01', '2026-10-10').state, 'unverified');
  assert.equal(checkRentalSchedule({}, {}, '', '').state, 'no-period');
});

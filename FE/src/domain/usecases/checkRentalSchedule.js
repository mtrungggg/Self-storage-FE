// Provisional date convention: [start, end); adjacent rentals do not overlap.
// No status interpretation or specific-unit allocation without a backend contract.
export function overlapsRentalPeriod(record, start, end) {
  const from = record.start_date?.slice(0, 10);
  const to = record.end_date?.slice(0, 10);
  if (!from || (to && to <= from)) return null;
  return from < end && (!to || to > start);
}

export function checkRentalSchedule(data, unit, start, end) {
  if (!start || !end || end <= start) return { state: 'no-period', reservations: 0, agreements: 0, incompleteDates: 0 };
  const same = (a, b) => a != null && b != null && String(a) === String(b);
  const reservations = (data.reservations ?? []).filter((record) => same(record.facility_id, unit.facility_id) && same(record.unit_type_id, unit.unit_type_id));
  const agreements = (data.rental_agreements ?? []).filter((record) => {
    if (!same(record.facility_id, unit.facility_id)) return false;
    const reservation = (data.reservations ?? []).find((item) => same(item.id, record.reservation_id));
    // Without the linked reservation, the agreement's unit type cannot be resolved.
    return !reservation || !same(reservation.facility_id, record.facility_id) || reservation.unit_type_id == null || same(reservation.unit_type_id, unit.unit_type_id);
  });
  const count = (records) => records.filter((record) => overlapsRentalPeriod(record, start, end) === true).length;
  return {
    state: 'unverified',
    reservations: count(reservations),
    agreements: count(agreements),
    incompleteDates: [...reservations, ...agreements].filter((record) => overlapsRentalPeriod(record, start, end) === null).length,
  };
}

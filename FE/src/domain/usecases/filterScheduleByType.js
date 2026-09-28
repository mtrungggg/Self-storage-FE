// Domain layer: pure filtering logic for staff handover/maintenance schedule items.
export function filterScheduleByType(items, typeId) {
  return items.filter((item) => item.type === typeId);
}

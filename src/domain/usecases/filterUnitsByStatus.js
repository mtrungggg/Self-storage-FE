// Domain layer: pure filtering logic for a storage unit collection by status.
export function filterUnitsByStatus(units, statusId) {
  if (statusId === "all") return units;
  return units.filter((unit) => unit.status === statusId);
}

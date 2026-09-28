// Domain layer: counts storage units matching a given status.
export function countUnitsByStatus(units, statusId) {
  return units.filter((unit) => unit.status === statusId).length;
}

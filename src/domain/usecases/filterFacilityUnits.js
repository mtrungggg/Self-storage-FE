// Domain layer: pure filtering logic for facility storage units.
export function filterFacilityUnits(units, zoneId, floorId) {
  return units.filter((unit) => {
    const matchesZone = zoneId === "all" || unit.zone === zoneId;
    const matchesFloor = !floorId || unit.floor === floorId;
    return matchesZone && matchesFloor;
  });
}

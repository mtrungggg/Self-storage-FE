// Domain layer: pure multi-criteria filtering for the facility unit directory.
export function filterUnitRecords(units, { floor = "all", zone = "all", size = "all", status = "all" } = {}) {
  return units.filter((unit) => {
    const matchesFloor = floor === "all" || unit.floor === floor;
    const matchesZone = zone === "all" || unit.zone === zone;
    const matchesSize = size === "all" || unit.size === size;
    const matchesStatus = status === "all" || unit.status === status;
    return matchesFloor && matchesZone && matchesSize && matchesStatus;
  });
}

// Domain layer: pure multi-criteria filtering for the system audit trail.
export function filterAuditTrail(events, { search = "", category = "all", status = "all", actorType = "all" } = {}) {
  const normalizedSearch = search.trim().toLowerCase();
  return events.filter((event) => {
    const matchesSearch =
      !normalizedSearch ||
      event.action.toLowerCase().includes(normalizedSearch) ||
      event.actor.toLowerCase().includes(normalizedSearch) ||
      event.ip.toLowerCase().includes(normalizedSearch);
    const matchesCategory = category === "all" || event.category === category;
    const matchesStatus = status === "all" || event.status === status;
    const matchesActorType = actorType === "all" || event.actorType === actorType;
    return matchesSearch && matchesCategory && matchesStatus && matchesActorType;
  });
}

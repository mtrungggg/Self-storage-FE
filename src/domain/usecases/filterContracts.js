// Domain layer: pure multi-criteria filtering for the contracts directory.
export function filterContracts(contracts, { search = "", audience = "all", cycle = "all", validity = "all" } = {}) {
  const normalizedSearch = search.trim().toLowerCase();
  return contracts.filter((contract) => {
    const matchesSearch =
      !normalizedSearch ||
      contract.id.toLowerCase().includes(normalizedSearch) ||
      contract.customer.toLowerCase().includes(normalizedSearch);
    const matchesAudience = audience === "all" || contract.audience === audience;
    const matchesCycle = cycle === "all" || contract.cycle === cycle;
    const matchesValidity = validity === "all" || contract.validity === validity;
    return matchesSearch && matchesAudience && matchesCycle && matchesValidity;
  });
}

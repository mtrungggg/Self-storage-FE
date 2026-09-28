// Domain layer: pure filtering logic for the admin user directory table.
export function filterUsers(users, { search = "", role = "all", facility = "all", status = "all", twoFactorMethod = "all" } = {}) {
  const normalizedSearch = search.trim().toLowerCase();
  return users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.id.toLowerCase().includes(normalizedSearch);
    const matchesRole = role === "all" || user.role === role;
    const matchesFacility = facility === "all" || user.facility === facility;
    const matchesStatus = status === "all" || user.status === status;
    const matchesTwoFactor = twoFactorMethod === "all" || user.twoFactorMethod === twoFactorMethod;
    return matchesSearch && matchesRole && matchesFacility && matchesStatus && matchesTwoFactor;
  });
}

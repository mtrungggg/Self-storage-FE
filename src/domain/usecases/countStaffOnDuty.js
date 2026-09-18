// Domain layer: counts staff whose shift on the given day is not "off".
export function countStaffOnDuty(departments, dayId) {
  return departments.reduce((total, department) => {
    const onDuty = department.staff.filter((member) => member.shifts[dayId]?.type !== "off").length;
    return total + onDuty;
  }, 0);
}
